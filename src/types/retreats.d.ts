interface Retreat {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolled: number;
  location: string;
  isActive: boolean;
  image: string; // Substitua pelo caminho correto das imagens
  status: "open" | "closed" | "running"; // Status do retiro,
  instructor?: string; // Opcional, caso tenha instrutor
}
