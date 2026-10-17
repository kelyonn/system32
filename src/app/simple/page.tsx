import Link from "next/link";
import { SimpleView } from "@/components/SimpleView";

export default function Simple() {
  return (
    <>
      <SimpleView />
      <p className="simple-back"><Link href="/">Back to the desk</Link></p>
    </>
  );
}
