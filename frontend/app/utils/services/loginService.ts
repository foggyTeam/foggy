export async function getPetById(id: number) {
  const data = await fetch(`https://petstore.swagger.io/v2/pet/${id}`);
  return await data.json();
}

export async function addNewPet(name: string, category: string, id: number) {
  const data = await fetch("https://petstore.swagger.io/v2/pet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: id,
      category: {
        id: 0,
        name: category,
      },
      name: name,
      photoUrls: ["string"],
      tags: [
        {
          id: 0,
          name: "string",
        },
      ],
      status: "available",
    }),
  });
  return data.status;
}
