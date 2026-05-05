import { Suspense } from "react";
import ValidaClient from "./ValidaClient";
import { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ data: string; token: string }>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const data = resolvedParams.data || "";
  return {
    title: `siceam.sev.gob.mx/ValidaQR.aspx?data=${data}`,
  };
}

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
