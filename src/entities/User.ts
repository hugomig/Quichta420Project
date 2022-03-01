import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Party } from './Party';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstname: string;

    @Column()
    lastname: string;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @OneToMany(() => Party, party => party.organizer)
    parties: Party[];
}