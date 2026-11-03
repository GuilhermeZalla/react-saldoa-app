import AccountScreen from '../../AccountScreen';
import { useSession } from '../../SessionContext';

export default function AccountRoute() {
    const { session, logout, accountDeleted } = useSession();

    return session === null ? null : (
        <AccountScreen
            session={session}
            onLogout={logout}
            onAccountDeleted={accountDeleted}
        />
    );
}
