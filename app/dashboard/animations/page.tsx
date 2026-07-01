import Link from "next/link";
import { createAnimation, getAnimations } from "@/actions/animations";

export default async function DashboardAnimationsPage() {
  async function createNewAnimation() {
    "use server";
    await createAnimation({ name: "New Animation" });
  }

  const animations = await getAnimations();

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Animations</h1>
        <form action={createNewAnimation}>
          <button
            type="submit"
            className="px-3 py-2 rounded-sm bg-blue text-white text-sm font-medium hover:bg-blue-dark"
          >
            Add Animation
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-2">
        {animations.length > 0 ? (
          animations.map((animation) => (
            <Link
              key={animation.id}
              href={`/animate/animation/${animation.id}`}
              className="w-full px-3 py-2 rounded-sm border border-gray-light-medium bg-white hover:bg-gray-light text-gray-medium-dark"
            >
              {animation.name}
            </Link>
          ))
        ) : (
          <div className="text-sm text-gray-medium">No animations yet.</div>
        )}
      </div>
    </div>
  );
}
