export function getUrlByReportType(type: any): string {
  const t = (
    typeof type === 'string' ? type : String(type || '')
  ).toLowerCase();

  switch (t) {
    case 'participant':
    case 'participants':
      return 'participant';

    case 'family':
    case 'families':
      return 'family';

    case 'ribbons':
      return 'ribbons';

    case 'tents':
      return 'tents';

    case 'fiveMinutesCard':
    case 'fiveminutescard':
      return 'fiveminutescard';

    case 'botafora':
    case 'bota-fora':
    case 'exitChecklist':
      return 'botafora';

    case 'service':
    case 'service_order':
    case 'service-orders':
    case 'serviceorders':
    case 'service_order_report':
      return 'service';

    case 'tent':
    case 'tents':
      return 'tent';

    case 'attendance':
    case 'attendance_report':
      return 'attendance';

    case 'financial':
    case 'finance':
    case 'financial_report':
      return 'financial';

    // add other known report types here

    default:
      // fallback route segment when type is unknown
      return 'participant';
  }
}
