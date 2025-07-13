// frontend/src/utils/statusUtils.js

export function getStatusTagColor(status) {
  if (!status) return 'default';

  if (status.startsWith('Partiellement')) {
    return 'processing';
  }

  switch (status) {
    case "Enregistrée":
      return "default";
    case "Confirmée":
      return "blue";
    case "Expédiée":
      return "cyan";
    case "Réceptionnée":
      return "warning";
    case "Clôturée":
      return "success";
    case "Facturée":
      return "purple";
    case "Archivée":
      return "default";
    default:
      return "default";
  }
}
