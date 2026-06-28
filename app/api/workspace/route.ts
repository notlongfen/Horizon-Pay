import { getWorkspaceData } from "@/lib/workspace/workspace-service";

export async function GET() {
  const data = await getWorkspaceData();

  return Response.json({
    success: true,
    data,
  });
}
