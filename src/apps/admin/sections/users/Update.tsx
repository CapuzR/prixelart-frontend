// src/apps/admin/sections/users/views/UpdateUser.tsx
import React, {
  ChangeEvent,
  FormEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useSnackBar } from 'context/GlobalContext';
import { User, USER_ROLE_OPTIONS } from 'types/user.types';
import { Prixer } from 'types/prixer.types';

import { getUserById, updateUser, getBalance, createWallet } from '@api/user.api';
import { isAValidEmail } from 'utils/validations';
import Grid2 from '@mui/material/Grid';
import { AddCircleOutline } from '@mui/icons-material';
import SaveIcon from '@mui/icons-material/Save';

import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Modal,
  Paper,
  Select,
  SelectChangeEvent,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { PickerChangeHandlerContext, DateValidationError } from '@mui/x-date-pickers';
import { Movement } from 'types/movement.types';
import { createMovement, getMovements, reverseMovement } from '@api/movement.api';
import DeleteIcon from '@mui/icons-material/Delete';

const AVAILABLE_GENDERS = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'];
const AVAILABLE_SPECIALTIES = [
  'Ilustración',
  'Diseño',
  'Fotografía',
  'Artes Plásticas',
  'Música',
  'Escritura',
];

type Sort = 'asc' | 'desc';
const formatCurrency = (value: number): string => `$${value.toFixed(2)}`;
const formatDate = (date?: Date): string => (date ? dayjs(date).format('DD/MM/YYYY') : 'N/A');

interface UserBaseValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  active?: string;
  avatar?: string;
  phone?: string;
  country?: string;
  city?: string;
  birthdate?: string;
  gender?: string;
  address?: string;
  billingAddress?: string;
  shippingAddress?: string;
  ci?: string;
  account?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
}
interface PrixerValidationErrors {
  specialty?: string;
  description?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  phone?: string;
  avatar?: string;
  termsAgree?: string; // Added termsAgree
}

interface HeadCell {
  id: keyof Movement | 'actions';
  label: string;
  numeric: boolean;
  sortable: boolean;
}

const headCells: readonly HeadCell[] = [
  { id: 'date', numeric: false, label: 'Fecha', sortable: true },
  { id: 'type', numeric: false, label: 'Tipo', sortable: true },
  { id: 'description', numeric: false, label: 'Descripción', sortable: true },
  { id: 'order', numeric: false, label: 'Orden Asociada', sortable: true },
  { id: 'value', numeric: true, label: 'Valor', sortable: true },
  { id: 'actions', numeric: false, label: 'Acciones', sortable: false },
];

interface UserValidationErrors extends UserBaseValidationErrors {
  prixer?: PrixerValidationErrors; // Nested errors for Prixer part
}

// --- Initial State (Aligned with CreateUser structure) ---
const initialUserFormState: Partial<User> = {
  firstName: '',
  lastName: '',
  email: '',
  active: true,
  role: ['consumer'],
  avatar: '',
  phone: '',
  country: '',
  city: '',
  birthdate: undefined,
  gender: '',
  address: '',
  billingAddress: '',
  shippingAddress: '',
  instagram: '',
  facebook: '',
  twitter: '',
  ci: '',
  account: '',
};

const initialPrixerFormState: Partial<Prixer> = {
  specialty: [],
  description: '',
  instagram: '',
  twitter: '',
  facebook: '',
  phone: '',
  avatar: '',
  termsAgree: false,
  status: true,
};

const initialFormState: Pick<Movement, 'description' | 'type' | 'value' | 'destinatary' | 'order'> =
  {
    description: '',
    type: 'Depósito',
    value: 0,
    destinatary: undefined,
    order: undefined,
  };

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const UpdateUser: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackBar } = useSnackBar();
  // const [permissions, setPermissions] = useState<PermissionsV2 | null>(null)

  const [userFormData, setUserFormData] = useState<Partial<User>>(initialUserFormState);
  const [prixerFormData, setPrixerFormData] = useState<Partial<Prixer>>(initialPrixerFormState);
  const [birthdateValue, setBirthdateValue] = useState<Dayjs | null>(null); // State for DatePicker
  const [originalUsername, setOriginalUsername] = useState<string>(''); // To display read-only username
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorFetch, setErrorFetch] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<UserValidationErrors | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [modal, setModal] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [value, setValue] = useState(0);
  type MovementType = 'Depósito' | 'Retiro';
  const movementTypeOptions: MovementType[] = ['Depósito', 'Retiro'];
  const [movements, setMovements] = useState<Movement[]>([]);
  const [totalMovements, setTotalMovements] = useState<number>(0);
  const [selectedMov, setSelectedMov] = useState<Movement | undefined>(undefined);

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [order, setOrder] = useState<Sort>('desc');
  const [orderBy, setOrderBy] = useState<keyof Movement>('date');
  const [page, setPage] = useState<number>(0);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [formData, setFormData] = useState(initialFormState);
  const [amount, setAmount] = useState('');

  const [openNewPay, setOpenNewPay] = useState<boolean>(false);

  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const isPrixerRoleSelected = userFormData.role?.includes('prixer');

  const loadUser = useCallback(async () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    if (!id) {
      setErrorFetch('ID de usuario inválido.');
      setIsLoading(false);
      showSnackBar('ID de usuario inválido.');
      navigate('/admin/users/read');
      return;
    }

    setIsLoading(true);
    setErrorFetch(null);
    setValidationErrors(null);

    try {
      const userData = await getUserById(id, { signal });
      setOriginalUsername(userData.username || 'N/A');

      setUserFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        active: userData.active ?? true,
        role: userData.role || ['consumer'],
        avatar: userData.avatar || '',
        phone: userData.phone || '',
        country: userData.country || '',
        city: userData.city || '',
        gender: userData.gender || '',
        address: userData.address || '',
        billingAddress: userData.billingAddress || '',
        shippingAddress: userData.shippingAddress || '',
        instagram: userData.instagram || '',
        facebook: userData.facebook || '',
        twitter: userData.twitter || '',
        ci: userData.ci || '',
        account: userData.account || '',
      });

      setBirthdateValue(userData.birthdate ? dayjs(userData.birthdate) : null);

      if (userData.prixer) {
        setPrixerFormData({
          specialty: userData.prixer.specialty || [],
          description: userData.prixer.description || '',
          instagram: userData.prixer.instagram || '',
          twitter: userData.prixer.twitter || '',
          facebook: userData.prixer.facebook || '',
          phone: userData.prixer.phone || '',
          avatar: userData.prixer.avatar || '',
          termsAgree: userData.prixer.termsAgree ?? false,
        });
        if (!userData.role?.includes('prixer')) {
          setUserFormData((prev) => ({
            ...prev,
            role: [...(prev.role || []), 'prixer'],
          }));
          console.warn("Prixer data found but role missing. Role 'prixer' added to form state.");
        }
        if (userData.account !== undefined) {
          const fetchedBalance = await getBalance(userData.account, { signal });
          if (fetchedBalance !== null) {
            setBalance(fetchedBalance);
          }
        }
      } else {
        setPrixerFormData(initialPrixerFormState);
        if (userData.role?.includes('prixer')) {
          setUserFormData((prev) => ({
            ...prev,
            role: prev.role?.filter((r) => r !== 'prixer') || [],
          }));
          console.warn("Role 'prixer' found but no data. Role 'prixer' removed from form state.");
        }
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        console.log('Request successfully aborted.');
        return;
      }
      console.error('Failed to load user:', err);
      const message =
        err.response?.data?.message || err.message || 'Error al cargar datos del usuario.';
      setErrorFetch(message);
      showSnackBar(message);
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [id, navigate, showSnackBar]);

  useEffect(() => {
    loadUser();
  }, []);

  const loadMovements = useCallback(
    async (showLoadingIndicator = true) => {
      if (showLoadingIndicator) setIsLoading(true);

      try {
        if (!userFormData.account) return;
        const apiPage = page + 1;
        const response = await getMovements({
          destinatary: userFormData.account,
          page: apiPage,
          limit: rowsPerPage,
          sortBy: orderBy,
          sortOrder: order,
          search: searchQuery,
          type: filterType,
          dateFrom: startDate?.toISOString(),
          dateTo: endDate?.toISOString(),
        });

        setMovements(response.data);
        setTotalMovements(response.totalCount);
        setErrorFetch(null);
      } catch (err: any) {
        const message = err.message || 'Error al cargar movimientos.';
        setErrorFetch(message);
        if (!showLoadingIndicator) {
          showSnackBar(`Error al actualizar: ${message}`);
        }
        console.error('Error fetching filtered/paginated data:', err);
      } finally {
        if (showLoadingIndicator || movements.length === 0) {
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [
      page,
      rowsPerPage,
      order,
      orderBy,
      showSnackBar,
      searchQuery,
      filterType,
      startDate,
      endDate,
      userFormData.account,
    ]
  );

  useEffect(() => {
    loadMovements();
  }, [loadMovements, userFormData.account]);

  // const triggerSearch = useCallback(() => {
  //   setPage(0)
  //   loadMovements(false)
  // }, [loadMovements])

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof Movement) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const openModal = () => {
    setModal(!modal);
  };

  // const handleUpdate = (movementId: string) => {
  //   if (!movementId) {
  //     showSnackBar("Falta ID.")
  //     return
  //   }
  //   navigate(`/admin/movements/update/${movementId}`)
  // }

  const handleUserInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>
  ) => {
    const target = event.target as any; // Need 'any' for Select compatibility
    const name = target.name as keyof User;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    setUserFormData((prevData) => ({ ...prevData, [name]: value }));

    // Clear validation error for this field
    if (validationErrors && validationErrors[name as keyof UserBaseValidationErrors]) {
      setValidationErrors((prevErrors) => {
        const updated = { ...prevErrors };
        delete updated[name as keyof UserBaseValidationErrors];
        // Return null if no errors remain to clear the error state completely
        return Object.keys(updated).length === 0 ? null : updated;
      });
    }
  };

  type RoleOptionType = (typeof USER_ROLE_OPTIONS)[number];
  const handleRolesChange = (event: SyntheticEvent, newValue: RoleOptionType[]) => {
    const roleValues = newValue.map((option) => option.value);
    const hadPrixerBefore = userFormData.role?.includes('prixer');
    const hasPrixerNow = roleValues.includes('prixer');

    setUserFormData((prev) => ({ ...prev, role: roleValues }));

    // Reset Prixer form AND clear its validation errors ONLY if the 'prixer' role was just removed
    if (hadPrixerBefore && !hasPrixerNow) {
      setPrixerFormData(initialPrixerFormState); // Reset Prixer specific data
      if (validationErrors?.prixer) {
        setValidationErrors((prev) => {
          const updated = { ...prev };
          delete updated.prixer; // Remove the nested prixer errors object
          return Object.keys(updated).length === 0 ? null : updated;
        });
      }
    }
    // Clear general role error if it existed
    if (validationErrors?.role) {
      setValidationErrors((prev) => {
        const updated = { ...prev };
        delete updated.role;
        return Object.keys(updated).length === 0 ? null : updated;
      });
    }
  };

  const handlePrixerInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = event.target as HTMLInputElement;
    const name = target.name as keyof Prixer;
    const value = target.type === 'checkbox' ? target.checked : target.value;

    setPrixerFormData((prevData) => ({ ...prevData, [name]: value }));

    if (validationErrors?.prixer && validationErrors.prixer[name as keyof PrixerValidationErrors]) {
      setValidationErrors((prevErrors) => {
        // Create a new prixer errors object without the cleared error
        const updatedPrixerErrors = { ...(prevErrors?.prixer || {}) };
        delete updatedPrixerErrors[name as keyof PrixerValidationErrors];

        // Create the main updated errors object
        const updated = { ...prevErrors };

        // If the prixer errors object is now empty, remove the 'prixer' key entirely
        if (Object.keys(updatedPrixerErrors).length === 0) {
          delete updated.prixer;
        } else {
          updated.prixer = updatedPrixerErrors;
        }

        // Return null if no errors remain at all
        return Object.keys(updated).length === 0 ? null : updated;
      });
    }
  };

  // Handler for Specialty Autocomplete
  const handleSpecialtyChange = (event: SyntheticEvent, newValue: string[]) => {
    setPrixerFormData((prev) => ({ ...prev, specialty: newValue }));
    // Clear specialty validation error if present
    if (validationErrors?.prixer?.specialty) {
      setValidationErrors((prevErrors) => {
        const updatedPrixerErrors = { ...(prevErrors?.prixer || {}) };
        delete updatedPrixerErrors.specialty;
        const updated = { ...prevErrors };
        if (Object.keys(updatedPrixerErrors).length === 0) {
          delete updated.prixer;
        } else {
          updated.prixer = updatedPrixerErrors;
        }
        return Object.keys(updated).length === 0 ? null : updated;
      });
    }
  };

  // Handler for Date Picker (Using the more robust version from CreateUser)
  const handleBirthdateChange = (
    newValue: unknown,
    context: PickerChangeHandlerContext<DateValidationError>
  ) => {
    // Convert various possible inputs to Dayjs or null
    const dayjsValue = newValue ? dayjs(newValue as Date | Dayjs | string) : null;

    // Basic check if Dayjs could parse it
    if (dayjsValue && dayjsValue.isValid()) {
      setBirthdateValue(dayjsValue);
    } else {
      // Handle invalid date input, maybe clear the value or show specific feedback
      setBirthdateValue(null);
      if (newValue) {
        // Only log if there was an attempt to set an invalid date
        console.error('Invalid date value received from DatePicker:', newValue);
      }
    }

    // Clear validation error for birthdate
    if (validationErrors?.birthdate) {
      setValidationErrors((prevErrors) => {
        if (!prevErrors) return null;
        const updated = { ...prevErrors };
        delete updated.birthdate;
        return Object.keys(updated).length === 0 ? null : updated;
      });
    }
  };

  // --- Validation (Adapted from CreateUser, no password/username checks) ---
  const validateForm = (): boolean => {
    const errors: UserValidationErrors = {};

    // --- User Validation ---
    if (!userFormData.firstName?.trim()) errors.firstName = 'Nombre obligatorio.';
    if (!userFormData.lastName?.trim()) errors.lastName = 'Apellido obligatorio.';
    if (!userFormData.email?.trim()) errors.email = 'Email obligatorio.';
    else if (!isAValidEmail(userFormData.email)) errors.email = 'Formato de Email inválido.';
    if (!userFormData.role || userFormData.role.length === 0)
      errors.role = 'Seleccione al menos un rol.';

    // Validate URL format for User avatar if provided
    if (userFormData.avatar && !/^https?:\/\/.+\..+/.test(userFormData.avatar)) {
      errors.avatar = 'Formato de URL inválido para avatar de usuario.';
    }
    // Add other User field validations  (e.g., phone format)

    // --- Prixer Validation (ONLY if the 'prixer' role is selected in the form) ---
    if (isPrixerRoleSelected) {
      const prixerErrors: PrixerValidationErrors = {};
      if (!prixerFormData.description?.trim()) {
        prixerErrors.description = 'Descripción de Prixer obligatoria.';
      }
      if (!prixerFormData.specialty || prixerFormData.specialty.length === 0) {
        prixerErrors.specialty = 'Seleccione al menos una especialidad.';
      }
      // Validate URL format for Prixer avatar if provided
      if (prixerFormData.avatar && !/^https?:\/\/.+\..+/.test(prixerFormData.avatar)) {
        prixerErrors.avatar = 'Formato de URL inválido para avatar de prixer.';
      }
      // Add validation for other *required* Prixer fields here (e.g., phone)
      // if (!prixerFormData.phone?.trim()) prixerErrors.phone = "Teléfono de Prixer obligatorio.";
      // if (!prixerFormData.termsAgree) prixerErrors.termsAgree = "Debe aceptar los términos."; // Example if terms became editable/required

      // If there are any prixer-specific errors, attach them to the main errors object
      if (Object.keys(prixerErrors).length > 0) {
        errors.prixer = prixerErrors;
      }
    }

    setValidationErrors(Object.keys(errors).length > 0 ? errors : null); // Set to null if no errors
    if (Object.keys(errors).length > 0) {
      showSnackBar('Por favor, corrija los errores indicados.');
    }
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id || !validateForm()) {
      // Ensure validation passes and ID exists
      return;
    }

    setIsSubmitting(true);

    const payload: Partial<User> = {
      firstName: userFormData.firstName,
      lastName: userFormData.lastName,
      email: userFormData.email?.toLowerCase(),
      // active: prixerFormData.status, TODO: use as Prixer prop, not a User one
      role: userFormData.role,

      avatar: userFormData.avatar?.trim() || undefined,
      phone: userFormData.phone?.trim() || undefined,
      country: userFormData.country?.trim() || undefined,
      city: userFormData.city?.trim() || undefined,
      birthdate: birthdateValue ? birthdateValue.toDate() : undefined,
      gender: userFormData.gender || undefined,
      address: userFormData.address?.trim() || undefined,
      billingAddress: userFormData.billingAddress?.trim() || undefined,
      shippingAddress: userFormData.shippingAddress?.trim() || undefined,
      instagram: userFormData.instagram?.trim() || undefined,
      facebook: userFormData.facebook?.trim() || undefined,
      twitter: userFormData.twitter?.trim() || undefined,
      ci: userFormData.ci?.trim() || undefined,
      account: userFormData.account?.trim() || undefined,
    };
    if (isPrixerRoleSelected) {
      payload.prixer = {
        specialty: prixerFormData.specialty || [],
        description: prixerFormData.description || '',
        termsAgree: prixerFormData.termsAgree ?? false,
        instagram: prixerFormData.instagram?.trim() || undefined,
        twitter: prixerFormData.twitter?.trim() || undefined,
        facebook: prixerFormData.facebook?.trim() || undefined,
        phone: prixerFormData.phone?.trim() || undefined,
        avatar: prixerFormData.avatar?.trim() || undefined,
        status: prixerFormData.status,
      };
    } else {
      payload.prixer = null as any;
    }

    try {
      console.log('Updating User Data for ID:', id, 'Payload:', payload);
      const response = await updateUser(id, payload); // Use the updateUser API call

      if (response) {
        // Assuming updateUser returns the updated user or a success indicator
        showSnackBar(`Usuario "${originalUsername}" actualizado correctamente.`);
        navigate('/admin/users/read'); // Navigate back to the list on success
      } else {
        // This case might occur if the API call resolves but indicates failure without throwing
        throw new Error('La API indicó que la actualización falló, pero no arrojó un error.');
      }
    } catch (err: any) {
      console.error('Failed to update user:', err);
      const message = err.response?.data?.message || err.message || 'Error al guardar los cambios.';
      // Try to display error message more generically or associate with a primary field
      setValidationErrors((prev) => ({ ...(prev || {}), firstName: message })); // Example: show near firstName
      showSnackBar(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitMovement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorSubmit(null);

    const payload: Partial<Movement> = {
      description: formData.description,
      type: formData.type,
      value: formData.value,
      destinatary: userFormData.account,
      order: formData.order || undefined,
    };

    try {
      const response = await createMovement(payload);

      if (response?.success) {
        setFormData(initialFormState);
        showSnackBar(
          `Movimiento "${formData.description.substring(0, 20)}..." creado exitosamente.`
        );
        if (response?.success) {
          setOpenNewPay(false);
          setAmount('');
          await Promise.all([loadUser(), loadMovements()]);
        }
      } else {
        throw new Error('La creación del movimiento no devolvió una respuesta esperada.');
      }
    } catch (err: any) {
      console.error('Failed to create movement:', err);
      const message = err.message || 'Error al crear el movimiento.';
      showSnackBar(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (movement: Movement) => {
    setSelectedMov(movement);
    openModal();
  };

  const deleteMovement = async () => {
    setIsLoading(true);
    try {
      if (selectedMov && selectedMov._id) {
        const response = await reverseMovement(selectedMov?._id);
        if (response) {
          showSnackBar(`Movimiento "${selectedMov?._id?.slice(-6)}..." revertido exitosamente.`);
        } else {
          throw new Error('La reversión del movimiento no devolvió una respuesta esperada.');
        }
      } else {
        console.error('No se pudo obtener el ID del movimiento seleccionado.');
      }
    } catch (err: any) {
      console.error('Failed to load data:', err);
      const errorMsg = err.message || 'Error al cargar los datos.';
      showSnackBar(errorMsg);
    } finally {
      setIsLoading(false);
      openModal();
      setSelectedMov(undefined);
    }
  };

  const handleCancel = () => {
    navigate('/admin/users/read');
  };

  const handleTypeChange = (event: SelectChangeEvent<MovementType>) => {
    const value = event.target.value as MovementType;
    setFormData((prevData) => ({
      ...prevData,
      type: value,
    }));
    if (errorSubmit) setErrorSubmit(null);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    if (errorSubmit) setErrorSubmit(null);
  };

  const handleBlur = () => {
    const inputValue = amount;
    const numericValue = parseFloat(inputValue);
    setFormData((prevData) => ({
      ...prevData,
      value: isNaN(numericValue) ? 0 : numericValue,
    }));
  };

  const newWallet = async () => {
    const response = await createWallet(userFormData?.email!);
    if (response.data.success) {
      showSnackBar('Cartera creada y balance actualizado exitosamente.');
      await loadUser();
    } else {
      showSnackBar('No fue posible crear la cartera, intente de nuevo');
    }
  };

  interface EnhancedTableProps {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Movement) => void;
    order: Sort;
    orderBy: string;
  }

  function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, onRequestSort } = props;
    const createSortHandler = (property: keyof Movement) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

    return (
      <TableHead sx={{ backgroundColor: (theme) => theme.palette.action.hover }}>
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.numeric ? 'right' : 'left'}
              padding={'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
              sx={{ fontWeight: 'bold' }}
            >
              {headCell.sortable ? (
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : 'asc'}
                  onClick={createSortHandler(headCell.id as keyof Movement)}
                >
                  {headCell.label}
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              ) : (
                headCell.label
              )}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
  }

  return (
    <>
      <Paper elevation={3} sx={{ p: 3, pt: 6 }}>
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 5,
            }}
          >
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Cargando datos...</Typography>
          </Box>
        )}

        {errorFetch && !isLoading && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <>
                <Button color="inherit" size="small" onClick={loadUser}>
                  Reintentar
                </Button>
                <Button color="inherit" size="small" onClick={handleCancel}>
                  Volver
                </Button>
              </>
            }
          >
            {errorFetch}
          </Alert>
        )}

        {!isLoading && !errorFetch && (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                justifyContent: 'center',
              }}
            >
              <Avatar
                src={userFormData?.avatar || prixerFormData?.avatar || undefined}
                alt={userFormData.username}
                sx={{ width: 56, height: 56 }}
              />{' '}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'start',
                }}
              >
                <Typography
                  variant="h3"
                  color="secondary"
                >{`${userFormData.firstName} ${userFormData.lastName}`}</Typography>
                <Typography variant="h6" color="secondary" sx={{ lineHeight: '80%' }}>
                  {userFormData?.role ? userFormData?.role[0] : 'Cliente'}
                </Typography>
              </Box>
            </Box>

            <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
              <Tab label="Info" {...a11yProps(0)} />
              <Tab label="Balance" {...a11yProps(1)} />
            </Tabs>
            <CustomTabPanel value={value} index={0}>
              <form onSubmit={handleSubmit} noValidate>
                <Grid2 container spacing={3}>
                  <Grid2 size={{ xs: 12 }}>
                    <Typography variant="h6">Información del Usuario</Typography>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Nombre de Usuario"
                      value={originalUsername}
                      fullWidth
                      disabled // Make it non-editable
                      InputLabelProps={{ shrink: true }} // Keep label floated
                      variant="filled" // Indicate it's read-only visually
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}></Grid2> {/* Spacer */}
                  {/* Name/Email */}
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Nombre"
                      name="firstName"
                      value={userFormData.firstName}
                      // onChange={handleUserInputChange}
                      onChange={(e) => {
                        setUserFormData((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }));
                      }}
                      required
                      fullWidth
                      disabled={isSubmitting}
                      error={!!validationErrors?.firstName}
                      helperText={validationErrors?.firstName}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Apellido"
                      name="lastName"
                      value={userFormData.lastName}
                      onChange={handleUserInputChange}
                      required
                      fullWidth
                      disabled={isSubmitting}
                      error={!!validationErrors?.lastName}
                      helperText={validationErrors?.lastName}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      value={userFormData.email}
                      onChange={handleUserInputChange}
                      required
                      fullWidth
                      disabled={isSubmitting}
                      error={!!validationErrors?.email}
                      helperText={validationErrors?.email}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Autocomplete
                      multiple
                      id="user-roles-select"
                      options={USER_ROLE_OPTIONS}
                      value={USER_ROLE_OPTIONS.filter((option) =>
                        (userFormData.role || []).includes(option.value)
                      )}
                      onChange={handleRolesChange}
                      disableCloseOnSelect
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) => option.value === value.value}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip label={option.label} size="small" {...getTagProps({ index })} />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Rol(es)"
                          error={!!validationErrors?.role}
                          helperText={validationErrors?.role}
                        />
                      )}
                      disabled={isSubmitting}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={prixerFormData.status}
                          onChange={handlePrixerInputChange}
                          name="status"
                          disabled={isSubmitting}
                        />
                      }
                      label="Usuario Activo"
                    />
                  </Grid2>
                  {/* <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="URL Avatar Usuario (Opcional)"
                  name="avatar"
                  type="url"
                  value={userFormData.avatar}
                  onChange={handleUserInputChange}
                  fullWidth
                  disabled={isSubmitting}
                  error={!!validationErrors?.avatar}
                  helperText={validationErrors?.avatar}
                />
                {userFormData.avatar && !validationErrors?.avatar && (
                  <Box sx={{ mt: 1, display: "flex", alignItems: "center" }}>
                    <Avatar
                      src={userFormData.avatar}
                      sx={{ width: 60, height: 60, mr: 1 }}
                    />
                    <Typography variant="caption">
                      Vista Previa (Usuario)
                    </Typography>
                  </Box>
                )}
              </Grid2> */}
                  <Grid2 size={{ xs: 12, sm: 6 }}></Grid2> {/* Spacer */}
                  <Grid2 size={{ xs: 12 }}>
                    <Divider sx={{ my: 2 }}>
                      <Typography variant="overline">Información Adicional (Opcional)</Typography>
                    </Divider>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 3 }}>
                    <TextField
                      label="Teléfono Usuario"
                      name="phone"
                      value={userFormData.phone}
                      onChange={handleUserInputChange}
                      fullWidth
                      disabled={isSubmitting}
                      error={!!validationErrors?.phone}
                      helperText={validationErrors?.phone}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 3 }}>
                    <TextField
                      label="CI / Identificación"
                      name="ci"
                      value={userFormData.ci}
                      onChange={handleUserInputChange}
                      fullWidth
                      disabled={isSubmitting}
                      error={!!validationErrors?.ci}
                      helperText={validationErrors?.ci}
                    />
                  </Grid2>
                  {/* <Grid2 size={{ xs: 12, sm: 3 }}>
                    <TextField
                      label="Nro Cuenta (si aplica)"
                      name="account"
                      value={userFormData.account}
                      onChange={handleUserInputChange}
                      fullWidth
                      disabled={isSubmitting}
                      error={!!validationErrors?.account}
                      helperText={validationErrors?.account}
                    />
                  </Grid2> */}
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Dirección Principal"
                      name="address"
                      value={userFormData.address}
                      onChange={handleUserInputChange}
                      fullWidth
                      multiline
                      rows={2}
                      disabled={isSubmitting}
                      error={!!validationErrors?.address}
                      helperText={validationErrors?.address}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Dirección de Facturación"
                      name="billingAddress"
                      value={userFormData.billingAddress}
                      onChange={handleUserInputChange}
                      fullWidth
                      multiline
                      rows={2}
                      disabled={isSubmitting}
                      error={!!validationErrors?.billingAddress}
                      helperText={
                        validationErrors?.billingAddress ||
                        'Opcional, si es diferente a la principal'
                      }
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Dirección de Envío"
                      name="shippingAddress"
                      value={userFormData.shippingAddress}
                      onChange={handleUserInputChange}
                      fullWidth
                      multiline
                      rows={2}
                      disabled={isSubmitting}
                      error={!!validationErrors?.shippingAddress}
                      helperText={
                        validationErrors?.shippingAddress ||
                        'Opcional, si es diferente a la principal'
                      }
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="País"
                      name="country"
                      value={userFormData.country}
                      onChange={handleUserInputChange}
                      fullWidth
                      disabled={isSubmitting}
                      error={!!validationErrors?.country}
                      helperText={validationErrors?.country}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Ciudad"
                      name="city"
                      value={userFormData.city}
                      onChange={handleUserInputChange}
                      fullWidth
                      disabled={isSubmitting}
                      error={!!validationErrors?.city}
                      helperText={validationErrors?.city}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 2 }}>
                    <DatePicker
                      label="Fecha de Nacimiento"
                      value={birthdateValue}
                      onChange={handleBirthdateChange} // Use the updated handler
                      disabled={isSubmitting}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!validationErrors?.birthdate,
                          helperText: validationErrors?.birthdate,
                        },
                      }}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 2 }}>
                    <FormControl fullWidth error={!!validationErrors?.gender}>
                      <InputLabel>Género</InputLabel>
                      <Select
                        name="gender"
                        value={userFormData.gender || ''} // Ensure controlled component
                        label="Género"
                        onChange={handleUserInputChange as any} // Cast needed for Select onChange
                        disabled={isSubmitting}
                      >
                        <MenuItem value="">
                          <em>Ninguno</em>
                        </MenuItem>
                        {AVAILABLE_GENDERS.map((g) => (
                          <MenuItem key={g} value={g}>
                            {g}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{validationErrors?.gender}</FormHelperText>
                    </FormControl>
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Instagram (Usuario)"
                      name="instagram"
                      value={userFormData.instagram}
                      onChange={handleUserInputChange}
                      fullWidth
                      disabled={isSubmitting}
                      error={!!validationErrors?.instagram}
                      helperText={validationErrors?.instagram}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Twitter (Usuario)"
                      name="twitter"
                      value={userFormData.twitter}
                      onChange={handleUserInputChange}
                      fullWidth
                      disabled={isSubmitting}
                      error={!!validationErrors?.twitter}
                      helperText={validationErrors?.twitter}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Facebook (Usuario)"
                      name="facebook"
                      value={userFormData.facebook}
                      onChange={handleUserInputChange}
                      fullWidth
                      disabled={isSubmitting}
                      error={!!validationErrors?.facebook}
                      helperText={validationErrors?.facebook}
                    />
                  </Grid2>
                  {isPrixerRoleSelected && (
                    <Grid2
                      size={{ xs: 12 }}
                      component={Paper}
                      variant="outlined"
                      sx={{ p: 2, mt: 3, mb: 1, borderStyle: 'dashed' }}
                    >
                      {' '}
                      {/* Visually group Prixer fields */}
                      <Grid2 container spacing={3}>
                        <Grid2 size={{ xs: 12 }}>
                          <Typography variant="h6">Detalles del Prixer</Typography>
                        </Grid2>

                        <Grid2 size={{ xs: 12 }}>
                          <TextField
                            label="Descripción / Bio Prixer"
                            name="description"
                            value={prixerFormData.description}
                            onChange={handlePrixerInputChange}
                            required={isPrixerRoleSelected} // Mark as required based on role selection
                            fullWidth
                            multiline
                            rows={4}
                            disabled={isSubmitting}
                            error={!!validationErrors?.prixer?.description}
                            helperText={validationErrors?.prixer?.description}
                          />
                        </Grid2>

                        <Grid2 size={{ xs: 12 }}>
                          <Autocomplete
                            multiple
                            id="prixer-specialties"
                            options={AVAILABLE_SPECIALTIES}
                            value={prixerFormData.specialty || []} // Ensure array
                            onChange={handleSpecialtyChange}
                            disableCloseOnSelect
                            freeSolo={false} // Set true if users can add custom specialties
                            getOptionLabel={(option) => option} // Simple string labels
                            renderTags={(value: readonly string[], getTagProps) =>
                              value.map((option: string, index: number) => (
                                <Chip label={option} size="small" {...getTagProps({ index })} />
                              ))
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Especialidades Prixer"
                                required={isPrixerRoleSelected} // Mark as required based on role
                                error={!!validationErrors?.prixer?.specialty}
                                helperText={
                                  validationErrors?.prixer?.specialty ||
                                  (isPrixerRoleSelected ? 'Seleccione al menos una' : '')
                                }
                              />
                            )}
                            disabled={isSubmitting}
                            isOptionEqualToValue={(option, value) => option === value}
                          />
                        </Grid2>

                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <TextField
                            label="Teléfono Prixer (Opcional)"
                            name="phone"
                            value={prixerFormData.phone}
                            onChange={handlePrixerInputChange}
                            fullWidth
                            disabled={isSubmitting}
                            error={!!validationErrors?.prixer?.phone}
                            helperText={validationErrors?.prixer?.phone}
                          />
                        </Grid2>
                        {/* <Grid2 size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="URL Avatar Prixer (Opcional)"
                        name="avatar"
                        type="url"
                        value={prixerFormData.avatar}
                        onChange={handlePrixerInputChange}
                        fullWidth
                        disabled={isSubmitting}
                        error={!!validationErrors?.prixer?.avatar}
                        helperText={validationErrors?.prixer?.avatar}
                      />
                    </Grid2> */}

                        {prixerFormData.avatar && !validationErrors?.prixer?.avatar && (
                          <Grid2 size={{ xs: 12 }}>
                            <Box
                              sx={{
                                mt: -2,
                                mb: 1,
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              {' '}
                              {/* Adjust spacing */}
                              <Avatar
                                src={prixerFormData.avatar}
                                sx={{ width: 60, height: 60, mr: 1 }}
                              />
                              <Typography variant="caption">Vista Previa (Prixer)</Typography>
                            </Box>
                          </Grid2>
                        )}

                        <Grid2 size={{ xs: 12, sm: 4 }}>
                          <TextField
                            label="Instagram (Prixer)"
                            name="instagram"
                            value={prixerFormData.instagram}
                            onChange={handlePrixerInputChange}
                            fullWidth
                            disabled={isSubmitting}
                            error={!!validationErrors?.prixer?.instagram}
                            helperText={validationErrors?.prixer?.instagram}
                          />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 4 }}>
                          <TextField
                            label="Twitter (Prixer)"
                            name="twitter"
                            value={prixerFormData.twitter}
                            onChange={handlePrixerInputChange}
                            fullWidth
                            disabled={isSubmitting}
                            error={!!validationErrors?.prixer?.twitter}
                            helperText={validationErrors?.prixer?.twitter}
                          />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 4 }}>
                          <TextField
                            label="Facebook (Prixer)"
                            name="facebook"
                            value={prixerFormData.facebook}
                            onChange={handlePrixerInputChange}
                            fullWidth
                            disabled={isSubmitting}
                            error={!!validationErrors?.prixer?.facebook}
                            helperText={validationErrors?.prixer?.facebook}
                          />
                        </Grid2>

                        <Grid2
                          size={{ xs: 12 }}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={prixerFormData.termsAgree ?? false}
                                onChange={handlePrixerInputChange}
                                name="termsAgree"
                                disabled={
                                  isSubmitting /* Or always disabled if not editable here */
                                }
                              />
                            }
                            label="Términos y Condiciones de Prixer Aceptados"
                          />
                          {validationErrors?.prixer?.termsAgree && (
                            <FormHelperText error>
                              {validationErrors.prixer.termsAgree}
                            </FormHelperText>
                          )}
                        </Grid2>
                      </Grid2>
                    </Grid2>
                  )}
                  <Grid2 size={{ xs: 12 }}>
                    <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                      <Button
                        type="button"
                        variant="outlined"
                        color="secondary"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting || isLoading}
                        startIcon={
                          isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
                        }
                      >
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                    </Stack>
                  </Grid2>
                  {validationErrors &&
                    !Object.keys(validationErrors).some((key) =>
                      ['firstName', 'lastName', 'email', 'role', 'prixer'].includes(key)
                    ) && (
                      <Grid2 size={{ xs: 12 }}>
                        <Alert severity="warning" sx={{ mt: 2 }}>
                          Se encontraron errores de validación generales no asociados a un campo
                          específico. Por favor revise el formulario.
                        </Alert>
                      </Grid2>
                    )}
                  {validationErrors &&
                    validationErrors.firstName &&
                    !validationErrors.lastName /* ... more specific checks maybe ... */ &&
                    !['Nombre obligatorio.'].includes(validationErrors.firstName) && (
                      <Grid2 size={{ xs: 12 }}>
                        <Alert severity="error" sx={{ mt: 2 }}>
                          Error de la API: {validationErrors.firstName}
                        </Alert>
                      </Grid2>
                    )}
                </Grid2>
              </form>
            </CustomTabPanel>

            <CustomTabPanel value={value} index={1}>
              <Grid2 container>
                <Grid2
                  size={{ xs: 12 }}
                  sx={{
                    mb: 6,
                    display: 'flex',
                    gap: '2rem',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography color="secondary" variant="h4" sx={{ textAlign: 'center' }}>
                    Balance:{' '}
                    {
                      <strong style={{ color: balance > 0 ? 'green' : 'red' }}>
                        {balance?.toLocaleString('de-DE', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                    }
                    $
                  </Typography>

                  {userFormData.account ? (
                    <>
                      <Button
                        sx={{ margin: '2rem 0' }}
                        onClick={() => setOpenNewPay(true)}
                        variant="outlined"
                        startIcon={<AddCircleOutline />}
                        disabled={isSubmitting}
                      >
                        Registrar Movimiento
                      </Button>
                      <Modal
                        open={openNewPay}
                        onClose={() => setOpenNewPay(false)}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 800,
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            borderRadius: 2,
                            pt: 4,
                            px: 4,
                            pb: 3,
                          }}
                        >
                          <Typography
                            color="secondary"
                            variant="h5"
                            sx={{ mb: 3, textAlign: 'center' }}
                          >
                            Registrar Movimiento
                          </Typography>
                          <form onSubmit={handleSubmitMovement}>
                            <Grid2 container spacing={3}>
                              <Grid2 size={{ xs: 12, sm: 6 }}>
                                <FormControl
                                  fullWidth
                                  required
                                  error={!!errorSubmit && !formData.type}
                                  disabled={isSubmitting}
                                >
                                  <InputLabel id="movement-type-select-label">
                                    Tipo de Movimiento
                                  </InputLabel>
                                  <Select<MovementType>
                                    labelId="movement-type-select-label"
                                    id="movement-type-select"
                                    value={formData.type}
                                    label="Tipo de Movimiento"
                                    onChange={handleTypeChange}
                                  >
                                    {movementTypeOptions.map((typeOption) => (
                                      <MenuItem key={typeOption} value={typeOption}>
                                        {typeOption}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid2>

                              <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                  label="Valor"
                                  name="value"
                                  type="number"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  onBlur={handleBlur}
                                  required
                                  fullWidth
                                  disabled={isSubmitting}
                                  inputProps={{ step: '0.01' }}
                                  error={!!errorSubmit && isNaN(formData.value)}
                                />
                              </Grid2>

                              <Grid2 size={{ xs: 12 }}>
                                <TextField
                                  label="Descripción"
                                  name="description"
                                  value={formData.description}
                                  onChange={handleInputChange}
                                  required
                                  fullWidth
                                  multiline
                                  rows={3}
                                  disabled={isSubmitting}
                                  error={!!errorSubmit && !formData.description.trim()}
                                />
                              </Grid2>
                              <Grid2 size={{ xs: 12, sm: 6 }}>
                                <TextField
                                  label="ID de Orden (Opcional)"
                                  name="order"
                                  value={formData.order || ''}
                                  onChange={handleInputChange}
                                  fullWidth
                                  disabled={isSubmitting}
                                  helperText="Asociar este movimiento a una orden específica"
                                />
                              </Grid2>

                              <Grid2 size={{ xs: 12 }}>
                                <Stack
                                  direction="row"
                                  justifyContent="flex-end"
                                  spacing={2}
                                  sx={{ mt: 2 }}
                                >
                                  <Button
                                    type="button"
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => setOpenNewPay(false)}
                                    disabled={isSubmitting}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={isSubmitting}
                                    startIcon={
                                      isSubmitting ? (
                                        <CircularProgress size={20} color="inherit" />
                                      ) : (
                                        <SaveIcon color="inherit" />
                                      )
                                    }
                                  >
                                    {isSubmitting ? 'Creando...' : 'Guardar Movimiento'}
                                  </Button>
                                </Stack>
                              </Grid2>

                              {errorSubmit && (
                                <Grid2 size={{ xs: 12 }}>
                                  <Alert severity="error" sx={{ mt: 2 }}>
                                    {errorSubmit}
                                  </Alert>
                                </Grid2>
                              )}
                            </Grid2>
                          </form>
                        </Box>
                      </Modal>
                    </>
                  ) : (
                    <Box>
                      <Typography>Este prixer no tiene cartera aún.</Typography>
                      <Button
                        sx={{ margin: '2rem auto', width: '100%' }}
                        onClick={newWallet}
                        variant="outlined"
                        startIcon={<AddCircleOutline />}
                        disabled={isSubmitting}
                      >
                        Crear Cartera
                      </Button>
                    </Box>
                  )}
                </Grid2>
                <Grid2 size={{ xs: 12 }}>
                  {!isLoading && movements.length === 0 && !errorFetch && (
                    <Alert severity="info" sx={{ m: 2 }}>
                      No se encontraron movimientos con los filtros aplicados.
                    </Alert>
                  )}
                  {isLoading && movements.length > 0 ? (
                    Array.from(new Array(rowsPerPage)).map((_, index) => (
                      <TableRow key={`skeleton-${index}`} style={{ height: 53 }}>
                        {headCells.map((cell) => (
                          <TableCell key={cell.id} align={cell.numeric ? 'right' : 'left'}>
                            <Skeleton animation="wave" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <Paper sx={{ width: '100%', mb: 2 }}>
                      <TableContainer>
                        <Table sx={{ minWidth: 750 }} aria-label="movements table">
                          <EnhancedTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                          />
                          <TableBody>
                            {/* Show Skeletons OR Actual Data */}
                            {isLoading && movements.length > 0
                              ? Array.from(new Array(rowsPerPage)).map((_, index) => (
                                  <TableRow key={`skeleton-${index}`} style={{ height: 53 }}>
                                    {headCells.map((cell) => (
                                      <TableCell
                                        key={cell.id}
                                        align={cell.numeric ? 'right' : 'left'}
                                      >
                                        <Skeleton animation="wave" />
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))
                              : movements.map((movement) => {
                                  return (
                                    <TableRow
                                      hover
                                      key={movement._id?.toString()}
                                      sx={{
                                        '&:last-child td, &:last-child th': {
                                          border: 0,
                                        },
                                      }}
                                    >
                                      {/* Apply responsive hiding here  */}
                                      <TableCell>{formatDate(movement.date)}</TableCell>
                                      <TableCell>{movement.type}</TableCell>
                                      <TableCell
                                        sx={{
                                          display: { xs: 'none', md: 'table-cell' },
                                        }}
                                      >
                                        {movement.description}
                                      </TableCell>
                                      <TableCell
                                        sx={{
                                          display: { xs: 'none', lg: 'table-cell' },
                                        }}
                                      >
                                        {movement.order ? (
                                          <Link
                                            component="button"
                                            variant="body2"
                                            onClick={
                                              () => {
                                                setSelectedOrderId(movement.order);
                                                // openModal()
                                              }
                                              //     navigate(
                                              //       `/admin/order/detail/${movement.order}`
                                              //     )
                                            }
                                            sx={{ textAlign: 'left' }}
                                          >
                                            {movement.order}
                                          </Link>
                                        ) : (
                                          '-'
                                        )}
                                      </TableCell>
                                      <TableCell
                                        align="right"
                                        sx={{
                                          color:
                                            movement.type === 'Depósito'
                                              ? 'success.main'
                                              : 'error.main',
                                          fontWeight: 'medium',
                                        }}
                                      >
                                        {`${movement.type === 'Retiro' ? '-' : ''} ${formatCurrency(movement.value)}`}
                                      </TableCell>
                                      <TableCell align="right">
                                        <Box
                                          sx={{
                                            display: 'flex',
                                            justifyContent: 'flex-end',
                                            gap: 0.5,
                                          }}
                                        >
                                          <Tooltip title="Eliminar Movimiento">
                                            <IconButton
                                              aria-label="edit"
                                              color="primary"
                                              onClick={() => handleDelete(movement)}
                                              disabled={!movement._id || isLoading}
                                              size="small"
                                            >
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                        </Box>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={totalMovements}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        labelRowsPerPage="Filas por página:"
                        labelDisplayedRows={({ from, to, count }) =>
                          `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                        }
                      />
                    </Paper>
                  )}
                </Grid2>
              </Grid2>
            </CustomTabPanel>
          </>
        )}
      </Paper>

      <Modal
        open={modal}
        onClose={openModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 800,
            bgcolor: 'background.paper',
            // border: "2px solid #000",
            boxShadow: 24,
            borderRadius: 2,
            pt: 2,
            px: 4,
            pb: 3,
          }}
        >
          <Grid2>
            <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
              ¿Seguro que quieres eliminar este movimiento?
            </Typography>
            <Typography>
              {`Se eliminará el movimiento #${selectedMov?._id?.slice(-6)} del historial y se
              revertirá su valor ($${selectedMov?.value}) del balance del prixer 
              ${userFormData.firstName} ${userFormData.lastName}.`}
            </Typography>
            <Grid2 sx={{ mt: 2, justifyContent: 'center', gap: 2, display: 'flex' }}>
              <Button color="secondary" onClick={() => openModal()} size="small" sx={{ ml: 1 }}>
                Cerrar
              </Button>
              <Button color="primary" onClick={() => deleteMovement()} size="small" sx={{ ml: 1 }}>
                Eliminar
              </Button>
            </Grid2>
          </Grid2>
        </Box>
      </Modal>
    </>
  );
};

export default UpdateUser;
