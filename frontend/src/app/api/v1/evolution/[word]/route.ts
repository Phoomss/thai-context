import { NextRequest } from "next/server";
import { GET as handler } from "../../dictionary/words/[word]/evolution/route";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ word: string }> }
) {
  return handler(request, context);
}
