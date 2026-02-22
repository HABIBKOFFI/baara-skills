import { MapPin, GraduationCap, BookOpen, Linkedin, Award } from 'lucide-react'
import type { Profile } from '@/types/profile'
import { cn } from '@/lib/utils'

interface ProfilCardProps {
  profile: Profile
  certificatsCount?: number
  className?: string
}

export default function ProfilCard({
  profile,
  certificatsCount = 0,
  className,
}: ProfilCardProps) {
  const initiales =
    (profile.prenom?.[0] ?? '') + (profile.nom?.[0] ?? '')

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5',
        className
      )}
    >
      {/* Avatar + nom */}
      <div className="flex items-center gap-4 mb-4">
        {profile.photo_url ? (
          <img
            src={profile.photo_url}
            alt={`${profile.prenom} ${profile.nom}`}
            className="w-14 h-14 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-[#1A2742] flex items-center justify-center text-white text-lg font-bold shrink-0 uppercase">
            {initiales || '?'}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-[18px] font-bold text-[#1A1A1A] truncate">
            {profile.prenom} {profile.nom}
          </h2>
          <p className="text-sm text-[#6B7280] truncate">
            {profile.domaine_etudes || 'Domaine non renseigné'}
          </p>
        </div>
      </div>

      {/* Infos */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <MapPin size={14} className="shrink-0" />
          <span>{profile.ville || 'Abidjan'}</span>
        </div>
        {profile.niveau_etudes && (
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <GraduationCap size={14} className="shrink-0" />
            <span>{profile.niveau_etudes}</span>
          </div>
        )}
        {profile.domaine_etudes && (
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <BookOpen size={14} className="shrink-0" />
            <span>{profile.domaine_etudes}</span>
          </div>
        )}
        {profile.linkedin_url && (
          <a
            href={profile.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-[#1A2742] hover:underline"
          >
            <Linkedin size={14} className="shrink-0" />
            <span className="truncate">LinkedIn</span>
          </a>
        )}
      </div>

      {/* Badge certificats */}
      {certificatsCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#F8F9FA] rounded-lg">
          <Award size={16} className="text-[#E9A23B]" />
          <span className="text-sm font-medium text-[#1A1A1A]">
            {certificatsCount} certificat{certificatsCount > 1 ? 's' : ''} obtenu
            {certificatsCount > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}
