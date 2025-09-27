'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, Phone, Mail, Star, Clock, Users, Stethoscope } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [hospitals] = useState<Hospital[]>(mockHospitals);

  const specialties = ['All', 'Cardiology', 'Neurology', 'Emergency', 'Orthopedics', 'Pediatrics', 'Oncology', 'Dermatology', 'Gynecology', 'Urology'];

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === '' || selectedSpecialty === 'All' || 
                             hospital.specialties.includes(selectedSpecialty);
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Hospitals</h1>
        <p className="text-muted-foreground">Discover healthcare facilities near you</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Hospitals</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="search"
                placeholder="Search by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="md:w-64">
            <Label htmlFor="specialty">Specialty</Label>
            <select
              id="specialty"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full p-2 border border-input bg-background rounded-md"
            >
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Hospital Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredHospitals.map((hospital) => (
          <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{hospital.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {hospital.address}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="flex items-center">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {hospital.rating}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    {hospital.phone}
                  </div>
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    {hospital.email}
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    {hospital.availability}
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    {hospital.distance} away
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <div className="flex items-center mb-2">
                    <Stethoscope className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium">Specialties</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {hospital.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">
                    Book Appointment
                  </Button>
                  <Button variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHospitals.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No hospitals found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        </div>
      )}
    </div>
  );
}
