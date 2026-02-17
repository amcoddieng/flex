import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  Calendar,
  MapPin,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

type ApplicationDetailModalProps = {
  open: boolean;
  loading: boolean;
  application: any;
  onClose: () => void;
  onUpdateStatus: (appId: number, status: string) => Promise<void>;
};

const statusConfig = {
  PENDING: { color: "bg-yellow-100", textColor: "text-yellow-800", icon: Clock, label: "En attente" },
  ACCEPTED: { color: "bg-green-100", textColor: "text-green-800", icon: CheckCircle, label: "Acceptée" },
  REJECTED: { color: "bg-red-100", textColor: "text-red-800", icon: XCircle, label: "Rejetée" },
  INTERVIEW: { color: "bg-blue-100", textColor: "text-blue-800", icon: Briefcase, label: "Entretien" },
};

export function ApplicationDetailModal({
  open,
  loading,
  application,
  onClose,
  onUpdateStatus,
}: ApplicationDetailModalProps) {
  if (!application) return null;

  const student = application.student;
  const config = statusConfig[application.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const StatusIcon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détail de la candidature</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status and job title */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{application.job_title}</h2>
                <Badge className={`${config.color} ${config.textColor} border-0`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Candidature du {new Date(application.applied_at).toLocaleDateString("fr-FR")}
              </p>
            </div>

            {/* Student info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-bold mb-4">Profil du candidat</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nom complet</p>
                  <p className="font-medium">
                    {student.first_name} {student.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Année d'études</p>
                  <p className="font-medium">
                    {student.year_of_study ? `Année ${student.year_of_study}` : "Non spécifié"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Université</p>
                  <p className="font-medium">{student.university || "Non spécifié"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground mb-1">Département</p>
                  <p className="font-medium">{student.department || "Non spécifié"}</p>
                </div>
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-3">
              <h3 className="font-bold">Coordonnées</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm">{student.email}</span>
                </div>
                {student.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm">{student.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bio and skills */}
            {student.bio && (
              <div>
                <h3 className="font-bold mb-2">À propos</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {student.bio}
                </p>
              </div>
            )}

            {student.skills && student.skills.length > 0 && (
              <div>
                <h3 className="font-bold mb-2">Compétences</h3>
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill: string, idx: number) => (
                    <Badge key={idx} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Application details */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-bold mb-3">Détails de la candidature</h3>
              <div className="space-y-3 text-sm">
                {application.message && (
                  <div>
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium mb-1">Message du candidat</p>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {application.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {application.experience && (
                  <div>
                    <p className="font-medium mb-1">Expérience</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {application.experience}
                    </p>
                  </div>
                )}

                {application.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <div>
                      <span className="font-medium">Date de début souhaitée:</span>{" "}
                      {new Date(application.start_date).toLocaleDateString("fr-FR")}
                    </div>
                  </div>
                )}

                {application.availability && (
                  <div>
                    <span className="font-medium">Disponibilité:</span> {application.availability}
                  </div>
                )}
              </div>
            </div>

            {/* Interview info if scheduled */}
            {application.status === "INTERVIEW" && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold mb-3">Entretien programmé</h3>
                <div className="space-y-2 text-sm">
                  {application.interview_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>
                        {new Date(application.interview_date).toLocaleDateString("fr-FR")}
                        {application.interview_time && ` à ${application.interview_time}`}
                      </span>
                    </div>
                  )}
                  {application.interview_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>{application.interview_location}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="border-t pt-4 flex gap-3">
              {application.status === "PENDING" && (
                <>
                  <Button
                    className="flex-1"
                    onClick={() => onUpdateStatus(application.id, "ACCEPTED")}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accepter
                  </Button>
                  <Button
                    className="flex-1"
                    variant="destructive"
                    onClick={() => onUpdateStatus(application.id, "REJECTED")}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeter
                  </Button>
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => onUpdateStatus(application.id, "INTERVIEW")}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    Entretien
                  </Button>
                </>
              )}
              {application.status === "ACCEPTED" && (
                <Button variant="outline" className="w-full">
                  Candidature acceptée
                </Button>
              )}
              {application.status === "REJECTED" && (
                <Button variant="outline" className="w-full">
                  Candidature rejetée
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
