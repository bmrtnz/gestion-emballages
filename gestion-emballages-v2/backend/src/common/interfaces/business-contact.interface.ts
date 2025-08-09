export interface IBusinessContact {
  fullName: string;
  position?: string;
  phone?: string;
  email?: string;
  isPrincipal: boolean;
  isActive: boolean;
  createdById?: string;
  updatedById?: string;
}

export interface IContactableEntity {
  contacts: IBusinessContact[];
  contactPrincipal?: IBusinessContact;
  contactsActifs?: IBusinessContact[];
}