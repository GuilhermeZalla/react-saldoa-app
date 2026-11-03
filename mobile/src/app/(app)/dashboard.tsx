import DashboardScreen from '../../DashboardScreen';
import { useSession } from '../../SessionContext';

export default function DashboardRoute() {
    const { session } = useSession();

    return session === null ? null : <DashboardScreen session={session} />;
}
