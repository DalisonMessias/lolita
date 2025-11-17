import React from 'react';

interface WatermarkedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
}

const WatermarkedImage: React.FC<WatermarkedImageProps> = ({ containerClassName, ...imgProps }) => {
  // A marca d'água foi removida da exibição na UI e agora é aplicada apenas durante o download/compartilhamento.
  return (
    <div className={`${containerClassName || ''}`}>
      <img {...imgProps} />
    </div>
  );
};

export default WatermarkedImage;
