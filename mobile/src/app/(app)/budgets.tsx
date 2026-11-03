import BudgetsScreen from '../../BudgetsScreen';
import { useSession } from '../../SessionContext';

export default function BudgetsRoute() {
    const { session } = useSession();

    return session === null ? null : <BudgetsScreen session={session} />;
}
