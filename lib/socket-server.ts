import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import mysql from 'mysql2/promise';
import { verifyToken } from './jwt';

export const config = {
  api: {
    bodyParser: false,
  },
};

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Socket.IO handler
const SocketHandler = (req: NextApiRequest, res: NextApiResponse & { socket: any }) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Initializing Socket.IO server');
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    // Authentication middleware pour Socket.IO
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = verifyToken(token);
        if (!decoded || (decoded.role !== 'STUDENT' && decoded.role !== 'EMPLOYER')) {
          return next(new Error('Invalid role'));
        }

        socket.data.user = decoded;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error'));
      }
    });

    io.on('connection', (socket) => {
      const user = socket.data.user;
      console.log(`User connected: ${user.role} - ${user.userId}`);

      // Join user to their personal room
      socket.join(`user_${user.userId}`);

      // Join conversations rooms based on user role
      socket.on('join_conversations', async () => {
        try {
          const connection = await pool.getConnection();
          
          if (user.role === 'STUDENT') {
            // Get student conversations
            const [studentResult] = await connection.execute(
              'SELECT id FROM student_profile WHERE user_id = ?',
              [user.userId]
            );
            
            if (Array.isArray(studentResult) && studentResult.length > 0) {
              const studentId = (studentResult as any[])[0].id;
              
              const [conversations] = await connection.execute(
                'SELECT id FROM conversation WHERE student_id = ?',
                [studentId]
              );
              
              (conversations as any[]).forEach(conv => {
                socket.join(`conversation_${conv.id}`);
              });
            }
          } else if (user.role === 'EMPLOYER') {
            // Get employer conversations
            const [employerResult] = await connection.execute(
              'SELECT id FROM employer_profile WHERE user_id = ?',
              [user.userId]
            );
            
            if (Array.isArray(employerResult) && employerResult.length > 0) {
              const employerId = (employerResult as any[])[0].id;
              
              const [conversations] = await connection.execute(
                'SELECT id FROM conversation WHERE employer_id = ?',
                [employerId]
              );
              
              (conversations as any[]).forEach(conv => {
                socket.join(`conversation_${conv.id}`);
              });
            }
          }
          
          connection.release();
        } catch (error) {
          console.error('Error joining conversations:', error);
        }
      });

      // Handle new message
      socket.on('send_message', async (data) => {
        try {
          const { conversationId, content } = data;
          
          console.log('🔥 WebSocket send_message received:', { conversationId, content, user });
          
          if (!conversationId || !content || !content.trim()) {
            console.log('❌ Invalid message data');
            socket.emit('error', { message: 'Invalid message data' });
            return;
          }

          const connection = await pool.getConnection();
          
          // Verify user belongs to conversation
          let belongsToConversation = false;
          let senderProfileId = null;
          
          if (user.role === 'STUDENT') {
            const [studentResult] = await connection.execute(
              'SELECT id FROM student_profile WHERE user_id = ?',
              [user.userId]
            );
            
            if (Array.isArray(studentResult) && studentResult.length > 0) {
              senderProfileId = (studentResult as any[])[0].id;
              
              const [convCheck] = await connection.execute(
                'SELECT id FROM conversation WHERE id = ? AND student_id = ?',
                [conversationId, senderProfileId]
              );
              
              belongsToConversation = Array.isArray(convCheck) && convCheck.length > 0;
            }
          } else if (user.role === 'EMPLOYER') {
            const [employerResult] = await connection.execute(
              'SELECT id FROM employer_profile WHERE user_id = ?',
              [user.userId]
            );
            
            if (Array.isArray(employerResult) && employerResult.length > 0) {
              senderProfileId = (employerResult as any[])[0].id;
              
              const [convCheck] = await connection.execute(
                'SELECT id FROM conversation WHERE id = ? AND employer_id = ?',
                [conversationId, senderProfileId]
              );
              
              belongsToConversation = Array.isArray(convCheck) && convCheck.length > 0;
            }
          }

          if (!belongsToConversation || !senderProfileId) {
            socket.emit('error', { message: 'Conversation not found or access denied' });
            connection.release();
            return;
          }

          // Insert message
          const [result] = await connection.execute(
            `INSERT INTO message (conversation_id, sender_type, sender_id, message, is_read, created_at) 
             VALUES (?, ?, ?, ?, 0, NOW())`,
            [conversationId, user.role.toLowerCase(), senderProfileId, content.trim()]
          );

          const messageId = (result as any).insertId;

          // Get message with sender info
          const [newMessage] = await connection.execute(
            `SELECT 
              m.id,
              m.conversation_id,
              m.sender_type,
              m.sender_id,
              m.message as content,
              m.is_read,
              m.created_at,
              CASE 
                WHEN m.sender_type = 'student' THEN sp.first_name || ' ' || sp.last_name
                WHEN m.sender_type = 'employer' THEN ep.company_name
                ELSE 'Utilisateur inconnu'
              END as sender_name
            FROM message m
            LEFT JOIN student_profile sp ON m.sender_id = sp.id AND m.sender_type = 'student'
            LEFT JOIN employer_profile ep ON m.sender_id = ep.id AND m.sender_type = 'employer'
            WHERE m.id = ?`,
            [messageId]
          );

          const messageData = (newMessage as any[])[0];
          console.log('📨 Message created and ready to broadcast:', messageData);
          
          // Broadcast to conversation room
          console.log('📡 Broadcasting to conversation room:', `conversation_${conversationId}`);
          io.to(`conversation_${conversationId}`).emit('new_message', messageData);
          console.log('✅ Message broadcasted successfully');
          
          // Also send to specific users for real-time updates
          const [participants] = await connection.execute(
            'SELECT student_id, employer_id FROM conversation WHERE id = ?',
            [conversationId]
          );
          
          if (Array.isArray(participants) && participants.length > 0) {
            const conv = (participants as any[])[0];
            
            // Get user IDs for notification
            if (user.role === 'STUDENT') {
              // Notify employer
              const [employerUser] = await connection.execute(
                'SELECT user_id FROM employer_profile WHERE id = ?',
                [conv.employer_id]
              );
              if (Array.isArray(employerUser) && employerUser.length > 0) {
                io.to(`user_${(employerUser as any[])[0].user_id}`).emit('message_notification', {
                  conversationId,
                  message: messageData
                });
              }
            } else if (user.role === 'EMPLOYER') {
              // Notify student
              const [studentUser] = await connection.execute(
                'SELECT user_id FROM student_profile WHERE id = ?',
                [conv.student_id]
              );
              if (Array.isArray(studentUser) && studentUser.length > 0) {
                io.to(`user_${(studentUser as any[])[0].user_id}`).emit('message_notification', {
                  conversationId,
                  message: messageData
                });
              }
            }
          }

          connection.release();
          
        } catch (error) {
          console.error('Error sending message:', error);
          socket.emit('error', { message: 'Failed to send message' });
        }
      });

      // Handle mark as read
      socket.on('mark_as_read', async (data) => {
        try {
          const { conversationId } = data;
          
          const connection = await pool.getConnection();
          
          // Mark messages as read for the other participant
          await connection.execute(
            `UPDATE message 
             SET is_read = TRUE 
             WHERE conversation_id = ? AND sender_type != ? AND is_read = FALSE`,
            [conversationId, user.role.toLowerCase()]
          );

          // Notify other participant that messages were read
          const [participants] = await connection.execute(
            'SELECT student_id, employer_id FROM conversation WHERE id = ?',
            [conversationId]
          );
          
          if (Array.isArray(participants) && participants.length > 0) {
            const conv = (participants as any[])[0];
            
            let otherUserId = null;
            if (user.role === 'STUDENT') {
              const [employerUser] = await connection.execute(
                'SELECT user_id FROM employer_profile WHERE id = ?',
                [conv.employer_id]
              );
              if (Array.isArray(employerUser) && employerUser.length > 0) {
                otherUserId = (employerUser as any[])[0].user_id;
              }
            } else if (user.role === 'EMPLOYER') {
              const [studentUser] = await connection.execute(
                'SELECT user_id FROM student_profile WHERE id = ?',
                [conv.student_id]
              );
              if (Array.isArray(studentUser) && studentUser.length > 0) {
                otherUserId = (studentUser as any[])[0].user_id;
              }
            }
            
            if (otherUserId) {
              io.to(`user_${otherUserId}`).emit('messages_read', { conversationId });
            }
          }

          connection.release();
          
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        const { conversationId } = data;
        socket.to(`conversation_${conversationId}`).emit('user_typing', {
          userId: user.userId,
          userType: user.role,
          conversationId
        });
      });

      socket.on('typing_stop', (data) => {
        const { conversationId } = data;
        socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
          userId: user.userId,
          userType: user.role,
          conversationId
        });
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${user.role} - ${user.userId}`);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};

export default SocketHandler;
