'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Phone, Mail, Star, Clock, Users, Stethoscope } from 'lucide-react';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  specialties: string[];
  availability: string;
  distance: string;
  image: string;
}

const mockHospitals: Hospital[] = [
  {
    id: '1',
    name: 'Apollo Hospital',
    address: '123 Medical District, Health City',
    phone: '+1 (555) 123-4567',
    email: 'info@apollo.com',
    rating: 4.8,
    specialties: ['Cardiology', 'Neurology', 'Emergency'],
    availability: '24/7 Emergency',
    distance: '2.5 km',
    image: '/api/placeholder/300/200'
  },
  {
    id: '2',
    name: 'Fortis Healthcare',
    address: '456 Wellness Avenue, Care Town',
    phone: '+1 (555) 234-5678',
    email: 'contact@fortis.com',
    rating: 4.6,
    specialties: ['Orthopedics', 'Pediatrics', 'Oncology'],
    availability: 'Mon-Fri 8AM-8PM',
    distance: '3.2 km',
    image: '/api/placeholder/300/200'
  },
  {
    id: '3',
    name: 'Max Hospital',
    address: '789 Health Boulevard, Medical Center',
    phone: '+1 (555) 345-6789',
    email: 'hello@max.com',
    rating: 4.7,
    specialties: ['Dermatology', 'Gynecology', 'Urology'],
    availability: 'Mon-Sat 9AM-6PM',
    distance: '1.8 km',
    image: '/api/placeholder/300/200'
  }
];

export default function HospitalPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [hospitals] = useState<Hospital[]>(mockHospitals);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication on component mount
    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push('/');
          return;
        }
        
        // If authenticated, load hospital data
        // TODO: Replace with actual API call
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  const specialties = ['All', 'Cardiology', 'Neurology', 'Emergency', 'Orthopedics', 'Pediatrics', 'Oncology', 'Dermatology', 'Gynecology', 'Urology'];

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === '' || selectedSpecialty === 'All' || 
                             hospital.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading hospital directory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-8">
      <div className="page-container">
        {/* Header */}
        <div className="section-spacing">
          <div className="animate-slide-in-top">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
              <Stethoscope className="h-10 w-10 text-primary" />
              Find Hospitals
            </h1>
            <p className="text-lg text-gray-600">Discover healthcare facilities near you</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="section-spacing">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="form-field-enhanced">
                  <Label htmlFor="search" className="text-sm font-semibold">Search Hospitals</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by name or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12"
                    />
                  </div>
                </div>
              </div>
              
              <div className="w-full sm:w-64">
                <div className="form-field-enhanced">
                  <Label htmlFor="specialty" className="text-sm font-semibold">Specialty</Label>
                  <select
                    id="specialty"
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="w-full h-12 px-4 py-2.5 border border-input bg-background rounded-lg text-base transition-all-smooth focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>{specialty}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hospital Cards */}
        <div className="section-spacing">
          {filteredHospitals.length === 0 ? (
            <Card className="card-enhanced animate-fade-in">
              <CardContent className="p-16 text-center">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No hospitals found</h3>
                <p className="text-gray-600 text-lg">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredHospitals.map((hospital, index) => (
                <div 
                  key={hospital.id}
                  className="animate-slide-in-bottom"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="card-enhanced hover:shadow-lg transition-all-smooth">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl font-semibold">{hospital.name}</CardTitle>
                          <CardDescription className="flex items-center mt-2">
                            <MapPin className="h-4 w-4 mr-2" />
                            {hospital.address}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="flex items-center">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {hospital.rating}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="card-spacing">
                      {/* Contact Info */}
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                          {hospital.phone}
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                          {hospital.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                          {hospital.availability}
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="h-4 w-4 mr-3 text-muted-foreground" />
                          {hospital.distance} away
                        </div>
                      </div>

                      {/* Specialties */}
                      <div>
                        <div className="flex items-center mb-3">
                          <Stethoscope className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm font-semibold">Specialties</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {hospital.specialties.map((specialty) => (
                            <Badge key={specialty} variant="outline" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-4">
                        <Button className="flex-1 btn-enhanced">
                          Book Appointment
                        </Button>
                        <Button variant="outline" className="btn-enhanced">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
