import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEventContext } from "@/contexts/EventContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import {
  Calendar as CalendarIcon,
  Clock,
  Filter,
  MapPin,
  MoreVertical,
  Package,
  Plus,
  Search,
  Users,
  Eye,
  Edit,
  UserPlus,
  PackageCheck,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { EventForm } from "@/components/events/EventForm";
import { TechnicianAssignment } from "@/components/events/TechnicianAssignment";
import { MaterialReservation } from "@/components/events/MaterialReservation";
import { EventDetails } from "@/components/events/EventDetails";

export default function Events() {
  const { events, addEvent, updateEvent, assignTechnicians, reserveMaterials } = useEventContext();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [openEventForm, setOpenEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openTechnicianAssignment, setOpenTechnicianAssignment] = useState(false);
  const [assigningEvent, setAssigningEvent] = useState<any>(null);
  const [openMaterialReservation, setOpenMaterialReservation] = useState(false);
  const [reservingEvent, setReservingEvent] = useState<any>(null);
  const [viewingEvent, setViewingEvent] = useState<any>(null);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);

  const handleAddEvent = (eventData: any) => {
    const newEventData = {
      title: eventData.title,
      startDate: formatDate(new Date(eventData.startDate)),
      endDate: formatDate(new Date(eventData.endDate)),
      time: `${eventData.startTime} - ${eventData.endTime}`,
      location: eventData.location,
      client: eventData.client,
      status: eventData.status,
      teamMembers: parseInt(eventData.teamMembers),
      equipments: parseInt(eventData.equipments),
      description: eventData.description,
      reservedMaterials: [],
      priority: eventData.priority || 'medium'
    };

    addEvent(newEventData);
  };

  const handleUpdateEvent = (eventData: any) => {
    const updatedEventData = {
      title: eventData.title,
      startDate: formatDate(new Date(eventData.startDate)),
      endDate: formatDate(new Date(eventData.endDate)),
      time: `${eventData.startTime} - ${eventData.endTime}`,
      location: eventData.location,
      client: eventData.client,
      status: eventData.status,
      teamMembers: parseInt(eventData.teamMembers),
      equipments: parseInt(eventData.equipments),
      description: eventData.description,
      priority: eventData.priority || 'medium'
    };

    updateEvent(eventData.id, updatedEventData);
    setEditingEvent(null);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setOpenEventForm(true);
  };

  const handleCloseForm = (open: boolean) => {
    setOpenEventForm(open);
    if (!open) {
      setEditingEvent(null);
    }
  };

  const handleAssignTechnicians = (event: any) => {
    setAssigningEvent(event);
    setOpenTechnicianAssignment(true);
  };

  const handleTechnicianAssignment = (technicianIds: number[]) => {
    if (assigningEvent) {
      assignTechnicians(assigningEvent.id, technicianIds);
      setAssigningEvent(null);
    }
  };

  const handleReserveMaterial = (event: any) => {
    setReservingEvent(event);
    setOpenMaterialReservation(true);
  };

  const handleMaterialReservation = (eventId: number, reservedMaterials: any[]) => {
    reserveMaterials(eventId, reservedMaterials);
    setReservingEvent(null);
  };

  const handleViewDetails = (event: any) => {
    setViewingEvent(event);
    setOpenDetailsModal(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmé":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Confirmé
          </Badge>
        );
      case "planifié":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Planifié
          </Badge>
        );
      case "en attente":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            En attente
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Layout title="Évènements">
      <Tabs defaultValue="list" className="w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <TabsList>
            <TabsTrigger value="list">Liste</TabsTrigger>
            <TabsTrigger value="calendar">Calendrier</TabsTrigger>
          </TabsList>
          <div className="mt-2 md:mt-0">
            <Button className="gap-2" onClick={() => setOpenEventForm(true)}>
              <Plus size={16} />
              Nouvel évènement
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Rechercher un évènement..."
              className="pl-8 bg-white border-gray-200 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter size={16} />
              Filtres
            </Button>
          </div>
        </div>

        <TabsContent value="list">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                event.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                event.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
          }).map((event) => (
              <Card key={event.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(event)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAssignTechnicians(event)}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Assigner techniciens
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleReserveMaterial(event)}>
                          <PackageCheck className="mr-2 h-4 w-4" />
                          Réserver matériel
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => {
                          toast.success("Événement annulé", {
                            description: `${event.title} a été annulé`
                          });
                        }}>
                          <X className="mr-2 h-4 w-4" />
                          Annuler
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {event.startDate === event.endDate
                          ? event.startDate
                          : `${event.startDate} - ${event.endDate}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{event.location}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{event.teamMembers} techniciens</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          {event.equipments} équipements
                          {event.reservedMaterials && event.reservedMaterials.length > 0 && (
                            <span className="text-green-600 ml-1">✓</span>
                          )}
                        </span>
                      </div>
                      {getStatusBadge(event.status)}
                    </div>

                    {event.reservedMaterials && event.reservedMaterials.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Matériel réservé:
                        </div>
                        <div className="space-y-1">
                          {event.reservedMaterials.slice(0, 3).map((material: any, index: number) => (
                            <div key={index} className="text-xs text-gray-600 flex justify-between">
                              <span>{material.productName}</span>
                              <span>×{material.quantity}</span>
                            </div>
                          ))}
                          {event.reservedMaterials.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{event.reservedMaterials.length - 3} autres...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Calendrier</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Évènements du jour</CardTitle>
                <CardDescription>3 Mai 2025</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Évènement</TableHead>
                      <TableHead className="hidden md:table-cell">Client</TableHead>
                      <TableHead className="hidden md:table-cell">Équipe</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div>
                          <div className="font-medium">Formation tactile ZHC</div>
                          <div className="text-sm text-muted-foreground">10:00 - 12:00</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">ZHC Corporate</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex -space-x-2">
                          <Avatar className="h-6 w-6 border-2 border-background">
                            <AvatarFallback className="bg-racha-blue/10 text-racha-blue text-xs">
                              HA
                            </AvatarFallback>
                          </Avatar>
                          <Avatar className="h-6 w-6 border-2 border-background">
                            <AvatarFallback className="bg-racha-blue/10 text-racha-blue text-xs">
                              IM
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                          Confirmé
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              toast.info("Détails de l'événement", {
                                description: "Formation tactile ZHC - Détails complets"
                              });
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditEvent(events[0])}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>
                        <div>
                          <div className="font-medium">Maintenance bornes MediTech</div>
                          <div className="text-sm text-muted-foreground">14:30 - 16:00</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">MediTech Labs</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex -space-x-2">
                          <Avatar className="h-6 w-6 border-2 border-background">
                            <AvatarFallback className="bg-racha-blue/10 text-racha-blue text-xs">
                              SA
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          Planifié
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              toast.info("Détails de l'événement", {
                                description: "Maintenance bornes MediTech - Détails complets"
                              });
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditEvent(events[1])}>
                              <Edit className="mr-2 h-4 w-4" />
                              Modifier
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <EventForm
        open={openEventForm}
        onOpenChange={handleCloseForm}
        onAddEvent={handleAddEvent}
        onUpdateEvent={handleUpdateEvent}
        editingEvent={editingEvent}
      />

      <TechnicianAssignment
        open={openTechnicianAssignment}
        onOpenChange={setOpenTechnicianAssignment}
        eventTitle={assigningEvent?.title || ""}
        eventDate={assigningEvent?.startDate || ""}
        currentAssignments={assigningEvent?.assignedTechnicians || []}
        onAssign={handleTechnicianAssignment}
      />

      <MaterialReservation
        open={openMaterialReservation}
        onOpenChange={setOpenMaterialReservation}
        event={reservingEvent}
        onReserve={handleMaterialReservation}
      />

      <EventDetails
        open={openDetailsModal}
        onOpenChange={setOpenDetailsModal}
        event={viewingEvent}
        onEdit={handleEditEvent}
        onAssignTechnicians={handleAssignTechnicians}
        onReserveMaterial={handleReserveMaterial}
      />
    </Layout>
  );
}
