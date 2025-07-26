export const getFileType = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const types = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff'],
    pdf: ['pdf'],
    word: ['doc', 'docx'],
    excel: ['xlsx', 'xls'],
    ppt: ['ppt', 'pptx'],
    video: ['mp4', 'avi', 'mkv', 'mov'],
    audio: ['mp3', 'wav', 'aac'],
    text: ['txt', 'csv'],
    encrypted: ['encrypted'],
  };

  for (const [type, extensions] of Object.entries(types)) {
    if (extensions.includes(ext)) return capitalize(type);
  }
  return 'Unknown';
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
