import { Notification } from '@/hooks/student/useNotifications';

export interface NotificationData {
  user_id: number;
  type: 'APPLICATION' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED' | 'VALIDATION' | 'PROJECT' | 'MESSAGE' | 'DISCUSSION';
  title: string;
  message: string;
  metadata?: any;
}

export class NotificationService {
  static async createNotification(notification: NotificationData): Promise<boolean> {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return false;

      const response = await fetch('/api/student/notifications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur création notification:', error);
      return false;
    }
  }

  static async notifyApplicationStatus(userId: number, status: 'ACCEPTED' | 'REJECTED' | 'INTERVIEW', projectName: string, projectId: number): Promise<boolean> {
    const notifications = {
      ACCEPTED: {
        type: 'ACCEPTED' as const,
        title: '🎉 Candidature acceptée !',
        message: `Félicitations ! Votre candidature pour le projet "${projectName}" a été acceptée.`
      },
      REJECTED: {
        type: 'REJECTED' as const,
        title: '❌ Candidature refusée',
        message: `Votre candidature pour le projet "${projectName}" n'a pas été retenue.`
      },
      INTERVIEW: {
        type: 'INTERVIEW' as const,
        title: '📅 Entretien demandé',
        message: `Le créateur du projet "${projectName}" souhaite vous rencontrer pour un entretien.`
      }
    };

    const notification = notifications[status];
    return this.createNotification({
      user_id: userId,
      ...notification,
      metadata: { projectId, projectName }
    });
  }

  static async notifyProjectUpdate(userId: number, projectName: string, projectId: number, updateType: 'NEW_MEMBER' | 'NEW_DISCUSSION' | 'PROJECT_UPDATE'): Promise<boolean> {
    const notifications = {
      NEW_MEMBER: {
        type: 'PROJECT' as const,
        title: '👋 Nouveau membre',
        message: `Un nouveau membre a rejoint votre projet "${projectName}".`
      },
      NEW_DISCUSSION: {
        type: 'DISCUSSION' as const,
        title: '💬 Nouvelle discussion',
        message: `Une nouvelle discussion a été créée dans votre projet "${projectName}".`
      },
      PROJECT_UPDATE: {
        type: 'PROJECT' as const,
        title: '🔄 Mise à jour du projet',
        message: `Votre projet "${projectName}" a été mis à jour.`
      }
    };

    const notification = notifications[updateType];
    return this.createNotification({
      user_id: userId,
      ...notification,
      metadata: { projectId, projectName }
    });
  }

  static async notifyMessage(userId: number, senderName: string, messagePreview: string, conversationId?: number): Promise<boolean> {
    return this.createNotification({
      user_id: userId,
      type: 'MESSAGE',
      title: `💬 Message de ${senderName}`,
      message: messagePreview.length > 50 ? `${messagePreview.substring(0, 50)}...` : messagePreview,
      metadata: { conversationId, senderName }
    });
  }

  static async notifyValidationStatus(userId: number, status: 'VALIDATED' | 'REJECTED', reason?: string): Promise<boolean> {
    const notifications = {
      VALIDATED: {
        type: 'VALIDATION' as const,
        title: '✅ Profil validé',
        message: 'Votre profil étudiant a été validé avec succès !'
      },
      REJECTED: {
        type: 'VALIDATION' as const,
        title: '❌ Profil refusé',
        message: reason || 'Votre profil n\'a pas pu être validé. Veuillez le compléter.'
      }
    };

    const notification = notifications[status];
    return this.createNotification({
      user_id: userId,
      ...notification,
      metadata: { status, reason }
    });
  }

  static async notifyNewApplication(userId: number, applicantName: string, projectName: string, applicationId: number): Promise<boolean> {
    return this.createNotification({
      user_id: userId,
      type: 'APPLICATION',
      title: '📋 Nouvelle candidature',
      message: `${applicantName} a postulé à votre projet "${projectName}".`,
      metadata: { applicationId, applicantName, projectName }
    });
  }
}
