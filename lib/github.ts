const owner = process.env.GITHUB_OWNER!
const repo = process.env.GITHUB_REPO!
const token = process.env.GITHUB_TOKEN!

export async function commitFileToGitHub(
  path: string,
  content: string,
  message: string
) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`

  let sha: string | undefined

  const existing = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  })

  if (existing.ok) {
    const existingData = await existing.json()
    sha = existingData.sha
  }

  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      sha,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(err)
  }

  return await response.json()
}