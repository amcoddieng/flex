"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/jwt";
import { Button } from "@/components/ui/button";
import { Users, Users2, Briefcase, FileText, BarChart3 } from "lucide-react";
import bcrypt from 'bcrypt';

const menuItems = [
  { icon: Users, label: "Utilisateurs", href: "/admin/users" },
  { icon: Users2, label: "Étudiants", href: "/admin/students" },
  { icon: Briefcase, label: "Employeurs", href: "/admin/employers" },
  { icon: Users, label: "Modérateurs", href: "/admin/moderators" },
  { icon: FileText, label: "Offres d'emploi", href: "/admin/jobs" },
];


export default function AdminPage() {


  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const decoded = token ? decodeToken(token) : null;
    
    if (decoded?.role !== 'ADMIN') {
      router.push('/login');
      return;
    }
    setIsAdmin(true);
  }, [router]);

  if (!isAdmin) {
    return <div className="p-8">Vérification...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Panneau d'administration</h1>
          <p className="text-slate-600">Gérez les utilisateurs, contenu et modération de FlexJob</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-blue-100 p-4 rounded-lg mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-slate-900">{item.label}</h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-slate-900">Informations système</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded">
              <div className="text-sm text-slate-600">Date</div>
              <div className="text-lg font-bold">{new Date().toLocaleDateString('fr-FR')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
