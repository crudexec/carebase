import Link from "next/link";
import { format } from "date-fns";
import { Award, CheckCircle, XCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { Badge, Card, CardContent } from "@/components/ui";

export default async function CertificateVerificationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const certificate = await prisma.trainingCertificate.findUnique({
    where: { verificationToken: token },
    include: {
      company: { select: { name: true } },
      course: { select: { title: true, category: true } },
      user: { select: { firstName: true, lastName: true } },
    },
  });

  const isValid = !!certificate && !certificate.revokedAt;

  return (
    <main className="min-h-screen bg-background-secondary px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardContent className="py-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Award className="h-8 w-8 text-primary" />
            </div>

            <h1 className="text-2xl font-bold">Training Certificate Verification</h1>

            {!certificate ? (
              <div className="mt-8 rounded-lg border border-error/30 bg-error/5 p-5">
                <XCircle className="mx-auto mb-3 h-8 w-8 text-error" />
                <p className="font-medium text-error">Certificate not found</p>
                <p className="mt-1 text-sm text-foreground-secondary">
                  The verification code does not match an issued CareBase training certificate.
                </p>
              </div>
            ) : (
              <div className="mt-8 space-y-6">
                <div className={`rounded-lg border p-5 ${isValid ? "border-success/30 bg-success/5" : "border-error/30 bg-error/5"}`}>
                  {isValid ? (
                    <CheckCircle className="mx-auto mb-3 h-8 w-8 text-success" />
                  ) : (
                    <XCircle className="mx-auto mb-3 h-8 w-8 text-error" />
                  )}
                  <Badge variant={isValid ? "success" : "error"}>
                    {isValid ? "Valid Certificate" : "Revoked Certificate"}
                  </Badge>
                </div>

                <dl className="grid gap-4 text-left sm:grid-cols-2">
                  <div>
                    <dt className="text-sm text-foreground-secondary">Recipient</dt>
                    <dd className="font-medium">
                      {certificate.user.firstName} {certificate.user.lastName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-foreground-secondary">Issued By</dt>
                    <dd className="font-medium">{certificate.company.name}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm text-foreground-secondary">Training</dt>
                    <dd className="font-medium">{certificate.course.title}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-foreground-secondary">Issued</dt>
                    <dd className="font-medium">{format(certificate.issuedAt, "MMMM d, yyyy")}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-foreground-secondary">Expires</dt>
                    <dd className="font-medium">
                      {certificate.expiresAt ? format(certificate.expiresAt, "MMMM d, yyyy") : "No expiration"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-foreground-secondary">Certificate No.</dt>
                    <dd className="font-medium">{certificate.certificateNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-foreground-secondary">Score</dt>
                    <dd className="font-medium">
                      {certificate.score == null ? "Not recorded" : `${certificate.score}%`}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            <Link href="/" className="mt-8 inline-block text-sm text-primary hover:underline">
              CareBase
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
