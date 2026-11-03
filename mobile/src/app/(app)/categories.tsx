import CategoriesScreen from '../../CategoriesScreen';
import { useSession } from '../../SessionContext';

export default function CategoriesRoute() {
    const { session } = useSession();

    return session === null ? null : <CategoriesScreen session={session} />;
}
