export async function fetchMemberMe(accessToken: string): Promise<{ email: string; name: string }> {
  const res = await fetch("http://52.79.237.86:8080/api/members/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch member info");
  return res.json();
}

export function cacheMemberInfo(email: string, name: string) {
  localStorage.setItem("memberEmail", email);
  localStorage.setItem("memberName", name);
}

export function clearMemberInfo() {
  localStorage.removeItem("memberEmail");
  localStorage.removeItem("memberName");
}
