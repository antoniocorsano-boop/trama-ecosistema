import { SpecializedReviewPilot } from "../components/SpecializedReviewPilot";
import { StudioHome } from "../components/StudioHome";

export default function Home() {
  return <><StudioHome />{process.env.NEXT_PUBLIC_AXF_REVIEW_ONLY==="true"&&<SpecializedReviewPilot />}</>;
}
