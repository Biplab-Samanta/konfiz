
import {
    House,
    ShoppingCart,
    UserRound,
    Heart,
    Search,
    Menu,
    LogOut,
    IceCreamCone,
    IceCreamBowl,
    Package,
    PackagePlus,
    LayoutDashboard,
    Users,
    ClipboardList,
    Truck,
    Settings,
    Tags,
    ChartNoAxesCombined,
    Mail,
    Phone,
    MapPin,
    Trash2,
    Pencil,
    Plus,
    Minus,
    ChevronDown,
    ChevronRight,
    ArrowRight,
    Star,
    Gift,
    SlidersHorizontal,
    CircleUserRound,
    CreditCard,
    ShoppingBag,
    Bell,
    Check,
    X
} from "lucide-react";


const iconSchema = {

    // WEBSITE
    home: House,
    cart: ShoppingCart,
    profile: UserRound,
    wishlist: Heart,
    search: Search,
    menu: Menu,
    logout: LogOut,

    // ICE CREAM
    iceCream: IceCreamCone,
    iceCreamBowl: IceCreamBowl,

    // PRODUCTS
    package: Package,
    addProduct: PackagePlus,
    shoppingBag: ShoppingBag,

    // ADMIN
    dashboard: LayoutDashboard,
    customers: Users,
    orders: ClipboardList,
    delivery: Truck,
    settings: Settings,
    categories: Tags,
    analytics: ChartNoAxesCombined,

    // CONTACT
    email: Mail,
    phone: Phone,
    location: MapPin,

    // ACTIONS
    delete: Trash2,
    edit: Pencil,
    add: Plus,
    remove: Minus,
    close: X,
    check: Check,

    // NAVIGATION
    dropdown: ChevronDown,
    next: ChevronRight,
    arrowRight: ArrowRight,

    // OTHER
    rating: Star,
    offers: Gift,
    filter: SlidersHorizontal,
    account: CircleUserRound,
    payment: CreditCard,
    notification: Bell

};

export default iconSchema;
