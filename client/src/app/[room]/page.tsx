import DrawingCanvas from "@/components/DrawingCanvas";

interface RoomPageProps {
  params: {
    room: string;
  };
}

export default function RoomPage({ params }: RoomPageProps) {
  return (
    <main className="w-screen h-screen">
      <DrawingCanvas roomSlug={params.room} />
    </main>
  );
}
