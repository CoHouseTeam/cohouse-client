export async function joinGroup(accessToken: string, nickname: string, inviteCode: string) {
  const res = await fetch("http://52.79.237.86:8080/api/groups/join", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ nickname, inviteCode }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Group join failed");
  }
  return res.json();
}
