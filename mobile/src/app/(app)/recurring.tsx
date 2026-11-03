import RecurringScreen from '../../RecurringScreen';
import { useSession } from '../../SessionContext';

export default function RecurringRoute() {
    const { session } = useSession();

    return session === null ? null : <RecurringScreen session={session} />;
}
