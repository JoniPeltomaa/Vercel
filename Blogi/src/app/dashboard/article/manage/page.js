import { Suspense } from "react";
import ManageArticle from "./ManageArticle";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-10">Ladataan...</div>}>
      <ManageArticle />
    </Suspense>
  );
}