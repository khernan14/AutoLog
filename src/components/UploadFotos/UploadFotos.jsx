import { useRef } from "react";
import {
  UploadWrapper,
  Label,
  FileInput,
  PreviewGrid,
  PreviewItem,
  PreviewImage,
  DeleteButton,
} from "./UploadFotos.styles";

export default function UploadFotos({ fotos, setFotos }) {
  const fileInputRef = useRef();

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const nuevasFotos = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setFotos((prev) => [...prev, ...nuevasFotos]);
  };

  const eliminarFoto = (index) => {
    const nuevas = [...fotos];
    URL.revokeObjectURL(nuevas[index].preview);
    nuevas.splice(index, 1);
    setFotos(nuevas);
  };

  return (
    <UploadWrapper>
      <Label>Sube una o más fotos</Label>
      <FileInput
        type="file"
        accept="image/*"
        multiple
        ref={fileInputRef}
        onChange={handleFilesChange}
      />

      <PreviewGrid>
        {fotos.map((foto, index) => (
          <PreviewItem key={index}>
            <PreviewImage src={foto.preview} alt={`foto-${index}`} />
            <DeleteButton type="button" onClick={() => eliminarFoto(index)}>
              ×
            </DeleteButton>
          </PreviewItem>
        ))}
      </PreviewGrid>
    </UploadWrapper>
  );
}
