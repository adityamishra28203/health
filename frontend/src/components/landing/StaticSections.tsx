import Link from "next/link";
import { Shield, Lock, FileText, Users, Heart, CheckCircle, Star, Award, Zap, Brain, Database, Globe, Smartphone } from "lucide-react";

// Static features data - no need for client-side state
const featuresData = [
  {
    icon: Lock,
    title: "End-to-End Encryption",
    description: "Your health data is encrypted with 256-bit AES encryption, ensuring maximum security and privacy.",
    color: "from-blue-600 to-cyan-600",
    delay: 0
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Fully compliant with HIPAA regulations and healthcare data protection standards.",
    color: "from-green-600 to-emerald-600",
    delay: 100
  },
  {
    icon: Users,
    title: "Decentralized Storage",
    description: "Your data is stored across multiple secure nodes, eliminating single points of failure.",
    color: "from-purple-600 to-violet-600",
    delay: 200
  },
  {
    icon: FileText,
    title: "Smart Contracts",
    description: "Automated, transparent, and tamper-proof health record management using blockchain technology.",
    color: "from-orange-600 to-red-600",
    delay: 300
  },
  {
    icon: Heart,
    title: "Patient Control",
    description: "You have complete control over your health data, with granular permissions and access management.",
    color: "from-pink-600 to-rose-600",
    delay: 400
  }
];

const testimonialsData = [
  {
    name: "Dr. Sarah Johnson",
    role: "Cardiologist",
    content: "SecureHealth has revolutionized how we manage patient data. The security and ease of use are unmatched.",
    rating: 5,
    avatar: "SJ"
  },
  {
    name: "Michael Chen",
    role: "Patient",
    content: "Finally, I have complete control over my health records. The blockchain technology gives me peace of mind.",
    rating: 5,
    avatar: "MC"
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "Family Physician",
    content: "The HIPAA compliance and security features make this the best health record system I've used.",
    rating: 5,
    avatar: "ER"
  }
];

const technologyData = [
  {
    icon: Brain,
    title: "AI-Powered Analytics",
    description: "Advanced AI algorithms analyze your health data to provide personalized insights and recommendations."
  },
  {
    icon: Database,
    title: "Blockchain Technology",
    description: "Immutable, transparent, and secure data storage using cutting-edge blockchain infrastructure."
  },
  {
    icon: Globe,
    title: "Global Interoperability",
    description: "Seamless integration with healthcare systems worldwide for universal health record access."
  },
  {
    icon: Smartphone,
    title: "Mobile-First Design",
    description: "Access your health records anywhere, anytime with our responsive mobile application."
  }
];

export function StaticFeaturesSection() {
  return (
    <section id="features" className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 mb-16 sm:mb-20 md:mb-24">
          <h2 className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-bold text-gray-800 tracking-tight">
            <span 
              style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #0891b2 50%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 8px rgba(30, 64, 175, 0.1)',
              }}
            >
              Why Choose SecureHealth?
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
            Experience the future of healthcare data management with cutting-edge technology and uncompromising security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresData.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="group">
                <div className="bg-white/80 backdrop-blur-sm border-2 border-blue-100/50 hover:shadow-2xl transition-all duration-500 rounded-3xl h-[320px] flex flex-col justify-center">
                  <div className="p-8 text-center">
                    <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function StaticTestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 mb-16 sm:mb-20 md:mb-24">
          <h2 className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-bold text-gray-800 tracking-tight">
            <span 
              style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #0891b2 50%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Trusted by Healthcare Professionals
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
            Join thousands of healthcare providers and patients who trust SecureHealth with their most sensitive data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialsData.map((testimonial, index) => (
            <div key={index} className="group">
              <div className="text-center bg-white/80 backdrop-blur-sm border-blue-100/50 hover:shadow-xl transition-all duration-500 rounded-3xl p-6 sm:p-8 md:p-8 h-[300px] sm:h-[320px] md:h-[340px] flex flex-col justify-between">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
                  <span className="text-white font-bold text-lg sm:text-xl">{testimonial.avatar}</span>
                </div>
                <div className="flex justify-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </blockquote>
                <div>
                  <div className="font-semibold text-gray-800">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StaticTechnologySection() {
  return (
    <section id="technology" className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-6 mb-16 sm:mb-20 md:mb-24">
          <h2 className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-bold text-gray-800 tracking-tight">
            <span 
              style={{
                background: 'linear-gradient(135deg, #1e40af 0%, #0891b2 50%, #059669 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Cutting-Edge Technology
            </span>
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto">
            Built on the latest blockchain and AI technologies to deliver unmatched security and performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {technologyData.map((tech, index) => {
            const IconComponent = tech.icon;
            return (
              <div key={index} className="group">
                <div className="bg-white/80 backdrop-blur-sm border-blue-100/50 hover:shadow-xl transition-all duration-500 rounded-3xl p-4 sm:p-6 md:p-8 text-center cursor-pointer h-[240px] sm:h-[260px] md:h-[280px] flex flex-col justify-between">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg`}>
                    <IconComponent className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4">{tech.title}</h3>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{tech.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}



