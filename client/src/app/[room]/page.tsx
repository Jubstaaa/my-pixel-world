import DrawingCanvas from "@/components/DrawingCanvas";

interface RoomPageProps {
  params: Promise<{
    room: string;
  }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { room } = await params;

  return (
    <main className="w-screen h-screen">
      <DrawingCanvas roomSlug={room} />
    </main>
  );
}
