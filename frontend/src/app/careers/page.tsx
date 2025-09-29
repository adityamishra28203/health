'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Users, 
  MapPin,
  Clock,
  ArrowRight,
  Heart,
  Shield,
  Code,
  Zap
} from 'lucide-react';

const openPositions = [
  {
    title: "Senior Full-Stack Developer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    experience: "5+ years",
    description: "Build scalable healthcare applications with React, Node.js, and blockchain technology."
  },
  {
    title: "Blockchain Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    experience: "3+ years",
    description: "Design and implement blockchain solutions for secure health data management."
  },
  {
    title: "Security Engineer",
    department: "Security",
    location: "San Francisco, CA",
    type: "Full-time",
    experience: "4+ years",
    description: "Ensure our platform meets the highest security standards for healthcare data."
  },
  {
    title: "Product Manager",
    department: "Product",
    location: "San Francisco, CA",
    type: "Full-time",
    experience: "3+ years",
    description: "Lead product strategy and work with cross-functional teams to deliver exceptional user experiences."
  },
  {
    title: "UX/UI Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    experience: "2+ years",
    description: "Create intuitive and accessible designs for healthcare applications."
  },
  {
    title: "DevOps Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    experience: "4+ years",
    description: "Manage cloud infrastructure and ensure high availability of our services."
  }
];

const benefits = [
  {
    icon: <Heart className="h-6 w-6" />,
    title: "Health & Wellness",
    description: "Comprehensive health insurance, mental health support, and wellness programs."
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Learning & Development",
    description: "Annual learning budget, conference attendance, and internal training programs."
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Work-Life Balance",
    description: "Flexible working hours, remote work options, and unlimited PTO."
  },
  {
    icon: <Code className="h-6 w-6" />,
    title: "Cutting-Edge Technology",
    description: "Work with the latest technologies in blockchain, AI, and healthcare."
  }
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="secondary" className="mb-6">
              <Briefcase className="h-3 w-3 mr-1" />
              Join Our Team
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              Build the Future of
              <span className="text-primary"> Healthcare</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Join our mission to revolutionize healthcare through secure, patient-controlled 
              health data management. Work with cutting-edge technology and make a real impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                View Open Positions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Learn About Our Culture
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Work With Us */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Work With Us?
            </h2>
            <p className="text-xl text-muted-foreground">
              Be part of a mission-driven team building the future of healthcare.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="card-enhanced h-full text-center">
                  <CardHeader>
                    <div className="p-3 bg-primary/10 rounded-lg text-primary w-fit mx-auto mb-4">
                      {benefit.icon}
                    </div>
                    <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 sm:py-20 bg-secondary/20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Open Positions
            </h2>
            <p className="text-xl text-muted-foreground">
              Find your perfect role and help us build the future of healthcare.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {openPositions.map((position, index) => (
              <motion.div
                key={position.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="card-enhanced h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <CardTitle className="text-xl">{position.title}</CardTitle>
                      <Badge variant="secondary">{position.department}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {position.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {position.type}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {position.experience}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {position.description}
                    </p>
                    <Button variant="outline" className="w-full">
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Our Culture
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                At SecureHealth, we believe that great products come from great teams. 
                We foster a culture of innovation, collaboration, and continuous learning.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span>Mission-driven work that makes a real impact on healthcare</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span>Diverse and inclusive environment where everyone can thrive</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span>Autonomy and ownership over your work</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span>Regular team events and company retreats</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <Card className="card-enhanced p-8">
                <CardHeader>
                  <CardTitle className="text-center">Join Our Mission</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-6xl mb-4">🏥</div>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Be part of a team that's revolutionizing healthcare through 
                    secure, patient-controlled health data management.
                  </p>
                  <Button className="w-full">
                    View All Positions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-primary to-primary/80">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Make an Impact?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Join our team and help us build the future of healthcare technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Browse Open Positions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-primary">
                Send Your Resume
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
