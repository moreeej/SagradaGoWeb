import { useState } from "react";
import { supabase } from "../../config/supabase";

export default function Testing() {
  const [groomFile, setGroomFile] = useState(null);
  const [brideFile, setBrideFile] = useState(null);

  const [groomPreview, setGroomPreview] = useState("");
  const [bridePreview, setBridePreview] = useState("");

  // const [groomPhoto, setGroomPhoto] = useState("");
  // const [bridePhoto, setBridePhoto] = useState("");

  async function uploadImage(file, namePrefix, setter) {
    const ext = file.name.split(".").pop();
    const fileName = `${namePrefix}_${Date.now()}.${ext}`;
    const filePath = `wedding/${fileName}`;

    const { error } = await supabase.storage
      .from("wedding")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Upload Error:", error);
      alert("Upload failed.");
      return;
    }

    const { data } = supabase.storage.from("wedding").getPublicUrl(filePath);

    setter(data.publicUrl);
  }

  async function handleUpload() {
    if (!groomFile && !brideFile) {
      alert("Please select files first.");
      return;
    }

    if (groomFile) {
      await uploadImage(groomFile, "groom_photo", setGroomPhoto);
    }

    if (brideFile) {
      await uploadImage(brideFile, "bride_photo", setBridePhoto);
    }

    alert("Upload success!");
  }

  const uploadProfileImage = [
    {
      key: "groom_1x1",
      title: "Groom Photo",
      fileSetter: setGroomFile,
      preview: groomPreview,
      previewSetter: setGroomPreview,
    },
    {
      key: "bride_1x1",
      title: "Bride Photo",
      fileSetter: setBrideFile,
      preview: bridePreview,
      previewSetter: setBridePreview,
    },
  ];

  return (
    <>
      {uploadProfileImage.map((elem) => (
        <div key={elem.key} style={{ marginBottom: "20px" }}>
          <h1>{elem.title}</h1>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              elem.fileSetter(file);

              if (file) {
                elem.previewSetter(URL.createObjectURL(file));
              }
            }}
          />

          {elem.preview && (
            <div>
              <h3>Preview:</h3>
              <img src={elem.preview} alt="Preview" width={200} />
            </div>
          )}

        </div>
      ))}

      <button onClick={handleUpload}>Upload</button>
    </>
  );
}
