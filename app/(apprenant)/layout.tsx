import Navbar from '@/components/shared/Navbar'

export default function ApprenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      {/* Espace pour nav desktop */}
      <div className="md:pt-16 pb-20 md:pb-0">
        {children}
      </div>
    </div>
  )
}
