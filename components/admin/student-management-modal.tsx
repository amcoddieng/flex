"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AdminModal } from "@/components/ui/admin-modal";
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Shield,
  ShieldOff,
  Trash2,
  Save,
  X
} from "lucide-react";

type Student = {
  id: number;
  email: string;
  role: string;
  blocked: boolean;
  created_at: string;
  profile_id?: number;
  first_name?: string;
  last_name?: string;
  phone?: string;
  university?: string;
  department?: string;
  year_of_study?: number;
  validation_status?: string;
  rejection_reason?: string;
  bio?: string;
  hourly_rate?: number;
  student_card_pdf?: string;
};

interface StudentManagementModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (studentId: number, updates: any) => void;
  onDelete: (studentId: number) => void;
}

export function StudentManagementModal({ 
  student, 
  isOpen, 
  onClose, 
  onUpdate,
  onDelete
}: StudentManagementModalProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'validation' | 'actions'>('info');
  const [formData, setFormData] = useState({
    validation_status: student?.validation_status || 'PENDING',
    rejection_reason: student?.rejection_reason || '',
    notification_message: '',
    blocked: student?.blocked || false
  });

  React.useEffect(() => {
    if (student) {
      setFormData({
        validation_status: student.validation_status || 'PENDING',
        rejection_reason: student.rejection_reason || '',
        notification_message: '',
        blocked: student.blocked || false
      });
    }
  }, [student]);

  const handleValidationUpdate = async () => {
    if (!student) return;
    
    setLoading(true);
    try {
      await onUpdate(student.id, {
        validation_status: formData.validation_status,
        rejection_reason: formData.validation_status === 'REJECTED' ? formData.rejection_reason : null,
        notification_message: formData.notification_message || `Votre profil a été ${formData.validation_status === 'VALIDATED' ? 'validé' : 'rejeté'} par l'administration.`
      });
      onClose();
    } catch (error) {
      console.error('Error updating validation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUnblock = async () => {
    if (!student) return;
    
    setLoading(true);
    try {
      await onUpdate(student.id, {
        blocked: !formData.blocked,
        notification_message: formData.blocked 
          ? 'Votre compte a été bloqué par ladministration.'
          : 'Votre compte a été débloqué par ladministration.'
      });
      onClose();
    } catch (error) {
      console.error('Error updating block status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!student) return;
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'étudiant ${student.first_name} ${student.last_name} ?`)) {
      return;
    }
    
    setLoading(true);
    try {
      await onDelete(student.id);
      onClose();
    } catch (error) {
      console.error('Error deleting student:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'VALIDATED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'VALIDATED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'PENDING': return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (!student) return null;

  return (
    <AdminModal 
      open={isOpen} 
      onOpenChange={onClose}
      title={`Gestion de l'étudiant: ${student.first_name} ${student.last_name}`}
      description="Informations complètes et actions de gestion"
      maxWidth="4xl"
    >
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'info' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <User className="h-4 w-4 mr-2" />
          Informations
        </button>
        <button
          onClick={() => setActiveTab('validation')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'validation' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Validation
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'actions' 
              ? 'border-blue-500 text-blue-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Shield className="h-4 w-4 mr-2" />
          Actions
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Nom complet</Label>
                  <p className="text-lg font-semibold text-gray-900">
                    {student.first_name} {student.last_name}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <p className="text-gray-900">{student.email}</p>
                  </div>
                </div>
                {student.phone && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Téléphone</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <p className="text-gray-900">{student.phone}</p>
                    </div>
                  </div>
                )}
                {student.university && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Université</Label>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <p className="text-gray-900">{student.university}</p>
                    </div>
                  </div>
                )}
                {student.department && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Département</Label>
                    <p className="text-gray-900">{student.department}</p>
                  </div>
                )}
                {student.year_of_study && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Année d'étude</Label>
                    <p className="text-gray-900">{student.year_of_study}ème année</p>
                  </div>
                )}
              </div>
              
              {student.bio && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Biographie</Label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{student.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Statut du compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Statut de validation</Label>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(student.validation_status)}`}>
                    {getStatusIcon(student.validation_status)}
                    {student.validation_status || 'Non défini'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Statut du compte</Label>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    student.blocked 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {student.blocked ? (
                      <>
                        <ShieldOff className="h-4 w-4" />
                        Bloqué
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4" />
                        Actif
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Date d'inscription</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <p className="text-gray-900">
                      {new Date(student.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                {student.rejection_reason && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Raison du rejet</Label>
                    <p className="text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                      {student.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'validation' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Gestion de la validation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Statut de validation</Label>
                <select
                  value={formData.validation_status}
                  onChange={(e) => setFormData({...formData, validation_status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PENDING">En attente</option>
                  <option value="VALIDATED">Validé</option>
                  <option value="REJECTED">Rejeté</option>
                </select>
              </div>

              {formData.validation_status === 'REJECTED' && (
                <div>
                  <Label className="text-sm font-medium text-gray-700">Raison du rejet</Label>
                  <Textarea
                    value={formData.rejection_reason}
                    onChange={(e) => setFormData({...formData, rejection_reason: e.target.value})}
                    placeholder="Expliquez pourquoi le profil est rejeté..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-gray-700">Message de notification</Label>
                <Textarea
                  value={formData.notification_message}
                  onChange={(e) => setFormData({...formData, notification_message: e.target.value})}
                  placeholder="Message qui sera envoyé à l'étudiant..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleValidationUpdate}
                  disabled={loading || (formData.validation_status === 'REJECTED' && !formData.rejection_reason.trim())}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Mettre à jour
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Actions du compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="text-center">
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3 ${
                      formData.blocked 
                        ? 'bg-red-100' 
                        : 'bg-green-100'
                    }`}>
                      {formData.blocked ? (
                        <ShieldOff className="h-8 w-8 text-red-600" />
                      ) : (
                        <Shield className="h-8 w-8 text-green-600" />
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {formData.blocked ? 'Débloquer le compte' : 'Bloquer le compte'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {formData.blocked 
                        ? 'Permettre à l\'étudiant d\'accéder à nouveau à la plateforme'
                        : 'Empêcher l\'étudiant d\'accéder à la plateforme'}
                    </p>
                    <Button
                      onClick={handleBlockUnblock}
                      disabled={loading}
                      variant={formData.blocked ? "default" : "destructive"}
                      className="w-full"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        formData.blocked ? (
                          <Shield className="h-4 w-4 mr-2" />
                        ) : (
                          <ShieldOff className="h-4 w-4 mr-2" />
                        )
                      )}
                      {formData.blocked ? 'Débloquer' : 'Bloquer'}
                    </Button>
                  </div>

                <Card className="p-4 border-red-200">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-3">
                      <Trash2 className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-red-900 mb-2">Supprimer le compte</h3>
                    <p className="text-sm text-red-600 mb-4">
                      Supprimer définitivement le compte et toutes les données associées
                    </p>
                    <Button
                      onClick={handleDelete}
                      disabled={loading}
                      variant="destructive"
                      className="w-full"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Supprimer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>
      )}
    </AdminModal>
  );
}
