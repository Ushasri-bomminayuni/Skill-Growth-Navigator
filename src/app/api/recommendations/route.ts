import { NextResponse } from "next/server";
import { getRecommendedOpportunities, getCompatibilityDetails } from "@/services/recommendations";
import { getUserProfile } from "@/services/database";
import { getOpportunities } from "@/services/database";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const recommendations = await getRecommendedOpportunities(userId);
    return NextResponse.json({ success: true, recommendations });
  } catch (error: any) {
    console.error("Error getting recommendations:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId, opportunityId } = await request.json();

    if (!userId || !opportunityId) {
      return NextResponse.json(
        { success: false, error: "userId and opportunityId are required" },
        { status: 400 }
      );
    }

    const result = await getCompatibilityDetails(userId, opportunityId);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Error getting compatibility details:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}