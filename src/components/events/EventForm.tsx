
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

const eventFormSchema = z.object({
  title: z.string().min(1, { message: "Le titre est requis" }),
  startDate: z.string().min(1, { message: "La date de début est requise" }),
  endDate: z.string().min(1, { message: "La date de fin est requise" }),
  startTime: z.string().min(1, { message: "L'heure de début est requise" }),
  endTime: z.string().min(1, { message: "L'heure de fin est requise" }),
  location: z.string().min(1, { message: "Le lieu est requis" }),
  client: z.string().min(1, { message: "Le client est requis" }),
  status: z.enum(["planifié", "confirmé", "en attente"]),
  teamMembers: z.string().min(1, { message: "Le nombre de techniciens est requis" }),
  equipments: z.string().min(1, { message: "Le nombre d'équipements est requis" }),
  description: z.string().min(1, { message: "La description est requise" }),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvent?: (event: EventFormValues) => void;
  onUpdateEvent?: (event: EventFormValues & { id: number }) => void;
  editingEvent?: any;
}

export function EventForm({ open, onOpenChange, onAddEvent, onUpdateEvent, editingEvent }: EventFormProps) {
  const isEditing = !!editingEvent;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTime: "09:00",
      endTime: "18:00",
      location: "",
      client: "",
      status: "planifié",
      teamMembers: "1",
      equipments: "0",
      description: "",
    },
  });

  // Mettre à jour le formulaire quand on édite un événement
  React.useEffect(() => {
    if (editingEvent && open) {
      try {
        const [startTime, endTime] = editingEvent.time.split(' - ');

        // Conversion sécurisée des dates
        const parseDate = (dateStr: string) => {
          // Si c'est déjà au format YYYY-MM-DD, on le garde
          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateStr;
          }
          // Sinon, on essaie de parser et convertir
          const date = new Date(dateStr);
          return date.toISOString().split('T')[0];
        };

        form.reset({
          title: editingEvent.title || "",
          startDate: parseDate(editingEvent.startDate),
          endDate: parseDate(editingEvent.endDate),
          startTime: startTime || "09:00",
          endTime: endTime || "18:00",
          location: editingEvent.location || "",
          client: editingEvent.client || "",
          status: editingEvent.status || "planifié",
          teamMembers: editingEvent.teamMembers?.toString() || "1",
          equipments: editingEvent.equipments?.toString() || "0",
          description: editingEvent.description || "",
        });
      } catch (error) {
        console.error("Erreur lors du parsing de l'événement:", error);
        // Valeurs par défaut en cas d'erreur
        form.reset({
          title: editingEvent.title || "",
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          startTime: "09:00",
          endTime: "18:00",
          location: editingEvent.location || "",
          client: editingEvent.client || "",
          status: editingEvent.status || "planifié",
          teamMembers: "1",
          equipments: "0",
          description: editingEvent.description || "",
        });
      }
    } else if (!editingEvent && open) {
      form.reset({
        title: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        startTime: "09:00",
        endTime: "18:00",
        location: "",
        client: "",
        status: "planifié",
        teamMembers: "1",
        equipments: "0",
        description: "",
      });
    }
  }, [editingEvent, open, form]);

  function onSubmit(data: EventFormValues) {
    if (isEditing && onUpdateEvent && editingEvent) {
      onUpdateEvent({ ...data, id: editingEvent.id });
      toast.success("Événement modifié", {
        description: `L'événement "${data.title}" a été modifié avec succès.`,
      });
    } else if (onAddEvent) {
      onAddEvent(data);
      toast.success("Événement créé", {
        description: `L'événement "${data.title}" a été créé avec succès.`,
      });
    }
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier l'événement" : "Créer un événement"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Modifier les informations de l'événement" : "Planifier un nouvel événement dans votre agenda"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre de l'événement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de début</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de fin</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de début</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure de fin</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu</FormLabel>
                    <FormControl>
                      <Input placeholder="Lieu de l'événement" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du client" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planifié">Planifié</SelectItem>
                        <SelectItem value="confirmé">Confirmé</SelectItem>
                        <SelectItem value="en attente">En attente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teamMembers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de techniciens</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="equipments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre d'équipements</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description de l'événement..." {...field} className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" className="w-full sm:w-auto">
                {isEditing ? "Modifier l'événement" : "Créer l'événement"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
