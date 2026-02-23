import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface AddressFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export const emptyAddress: AddressFields = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  postcode: '',
  country: 'AU',
};

interface AddressFormProps {
  values: AddressFields;
  onChange: (fields: AddressFields) => void;
  prefix: string;
  showEmailPhone?: boolean;
}

export const AddressForm = ({ values, onChange, prefix, showEmailPhone = false }: AddressFormProps) => {
  const update = (field: keyof AddressFields, value: string) =>
    onChange({ ...values, [field]: value });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-firstName`}>First Name *</Label>
        <Input id={`${prefix}-firstName`} value={values.firstName} onChange={e => update('firstName', e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-lastName`}>Last Name *</Label>
        <Input id={`${prefix}-lastName`} value={values.lastName} onChange={e => update('lastName', e.target.value)} required />
      </div>
      {showEmailPhone && (
        <>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}-email`}>Email *</Label>
            <Input id={`${prefix}-email`} type="email" value={values.email} onChange={e => update('email', e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${prefix}-phone`}>Phone</Label>
            <Input id={`${prefix}-phone`} type="tel" value={values.phone} onChange={e => update('phone', e.target.value)} />
          </div>
        </>
      )}
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${prefix}-address1`}>Address *</Label>
        <Input id={`${prefix}-address1`} value={values.address1} onChange={e => update('address1', e.target.value)} required />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${prefix}-address2`}>Apartment, suite, etc.</Label>
        <Input id={`${prefix}-address2`} value={values.address2} onChange={e => update('address2', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-city`}>City *</Label>
        <Input id={`${prefix}-city`} value={values.city} onChange={e => update('city', e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-state`}>State / Province</Label>
        <Input id={`${prefix}-state`} value={values.state} onChange={e => update('state', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-postcode`}>Postcode *</Label>
        <Input id={`${prefix}-postcode`} value={values.postcode} onChange={e => update('postcode', e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-country`}>Country</Label>
        <Input id={`${prefix}-country`} value={values.country} onChange={e => update('country', e.target.value)} />
      </div>
    </div>
  );
};
