import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-xl card-padding-lg text-center">
      <h1 className="text-h3">Unauthorized</h1>
      <p className="text-muted-foreground">
        You don’t have permission to view this page.
      </p>
      <Link href="/">Go back to home</Link>
    </div>
  );
}
