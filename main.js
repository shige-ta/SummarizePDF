const pdfFile = document.getElementById("pdf-file");
const pdfText = document.getElementById("pdf-text");

// async function sendQuestion(question) {
//   const response = await fetch("http://localhost:3000/api/chatgpt", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ question: question }),
//   });

//   const data = await response.json();
//   //   console.log(data.answer);
//   return data.answer;
// }

async function sendQuestion(question) {
  console.log(question);
  try {
    const response = await fetch("http://localhost:3000/api/chatgpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: question }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error:", error.message, "Details:", error.details);
      return;
    }

    const data = await response.json();
    console.log(data.answer);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

pdfFile.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
  let extractedText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    textContent.items.forEach((item) => {
      extractedText += item.str + " ";
    });
  }

  //   console.log(extractedText);

  // pdfText.textContent = extractedText;

  pdfText.textContent = sendQuestion(extractedText);

  console.log(pdfText.textContent);
});
