import TransactionsScreen from '../../TransactionsScreen';
import { useSession } from '../../SessionContext';

export default function TransactionsRoute() {
    const { session } = useSession();

    return session === null ? null : <TransactionsScreen session={session} />;
}
