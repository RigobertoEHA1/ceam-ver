import { Suspense } from "react";
import ValidaClient from "./ValidaClient";

// Server component to handle the route
export default async function ValidaQRPage({
  searchParams,
}: {
  searchParams: Promise<{ data: string; token: string }>;
}) {
  const resolvedParams = await searchParams;
  const data = resolvedParams.data || "";
  const token = resolvedParams.token || "";

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Cargando...</div>}>
      <ValidaClient dataHash={data} token={token} />
    </Suspense>
  );
}
