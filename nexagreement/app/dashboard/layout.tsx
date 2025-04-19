import Navbar from "../components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] relative">
      <Navbar />
      
      {/* Gradient mesh background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-blue-500/10" />
        <div className="absolute w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      </div>
      
      {/* Grid pattern overlay */}
      <div 
        className="fixed inset-0 -z-10 h-full w-full opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l9.9-9.9h-2.83zM32 0l-3.486 3.485-1.414 1.414L40.97 0H32zM0 0c1.837 4.382 4.298 7.384 7.372 9H0V0zm60 0v9h-7.372C55.702 7.384 58.163 4.382 60 0zM0 60V51h7.372C4.298 52.616 1.837 55.618 0 60zm60-60c-1.837 4.382-4.298 7.384-7.372 9H60V0zM0 0c1.837 4.382 4.298 7.384 7.372 9H0V0zm60 0v9h-7.372C55.702 7.384 58.163 4.382 60 0zM0 60V51h7.372C4.298 52.616 1.837 55.618 0 60zm60-60c-1.837 4.382-4.298 7.384-7.372 9H60V0zM7.372 0L0 7.372V0h7.372zm0 60L0 52.628V60h7.372zM60 7.372L52.628 0H60v7.372zm0 52.628L52.628 60H60v-7.372z' fill='rgba(255, 255, 255, 0.025)' fill-rule='evenodd'/%3E%3C/svg%3E")`
        }}
      />

      {/* Main content */}
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl animate-fade-in">
          {children}
        </div>
      </main>

      {/* Floating orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10px] opacity-30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full" 
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0) 70%)',
              animation: 'float 20s ease-in-out infinite'
            }}
          />
          <div className="absolute top-1/4 right-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(147,51,234,0.1) 0%, rgba(147,51,234,0) 70%)',
              animation: 'float 25s ease-in-out infinite reverse'
            }}
          />
        </div>
      </div>
    </div>
  );
} 