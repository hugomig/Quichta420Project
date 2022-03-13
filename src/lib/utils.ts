import { FastifyReply, FastifyRequest } from "fastify";
import { Invitation, UserRole } from "../entities/Invitation";
import { Party } from "../entities/Party";
import { User } from "../entities/User";
import { Item } from "../entities/Item";
import { connection } from "./connection";


export const checkUserExists: (username: string, req: FastifyRequest, res: FastifyReply) => Promise<User | null> = async (username, req, res) => {
    const user = await connection.getRepository(User).findOne({ username });
    if(!user) {
        res.status(400).send("User not found, check username");
        return null;
    }
    return user;
}

export const checkIfUserIsMe = (user: User, req: FastifyRequest, res: FastifyReply) => {
    if(user.id !== req.user.id) {
        res.status(400).send("You are not authorized to deal with this user");
        return false;
    }
    return true;
}

export const checkPartyExists: (id: string, req: FastifyRequest, res: FastifyReply) => Promise<Party | null> = async (id, req, res) => {
    const party = await connection.getRepository(Party).findOne({ id });
    if(!party) {
        res.status(400).send("Party not found");
        return null;
    }
    return party;
}

export const checkIsOrganizerForParty = async (party: Party, user: User, req: FastifyRequest, res: FastifyReply) => {
    const myParty = await connection.getRepository(Party).findOne({ id: party.id, creator: user });
    if(myParty){
        return true;
    }
    const invitation = await connection.getRepository(Invitation).findOne({ user, party });
    if(invitation){
        if(invitation.role === UserRole.Organizer){
            return true;
        }
    }
    res.status(400).send("User not organizer for this party");
    return false;
}

export const checkIsInvitorForParty = async (party: Party, user: User, req: FastifyRequest, res: FastifyReply) => {
    const myParty = await connection.getRepository(Party).findOne({ id: party.id, creator: user });
    if(myParty){
        return true;
    }
    const invitation = await connection.getRepository(Invitation).findOne({ user, party });
    if(invitation){
        if(invitation.role === UserRole.Organizer || invitation.role === UserRole.Invitor){
            return true;
        }
    }
    res.status(400).send("User not invitor for this party");
    return false;
}

export const checkIsInvitedToParty = async (party: Party, user: User, req: FastifyRequest, res: FastifyReply) => {
    const myParty = await connection.getRepository(Party).findOne({ id: party.id, creator: user });
    if(myParty){
        return true;
    }
    const invitation = await connection.getRepository(Invitation).findOne({ party: party, user: user });
    if(invitation){
        return true;
    }
    res.status(400).send("Sorry you are not invited to this party");
    return false;
}

export const checkInvitationExists: (id: string, req: FastifyRequest, res: FastifyReply) => Promise<Invitation | null> =  async (id, req, res) => {
    const invitation = await connection.getRepository(Invitation).findOne({ id: id });
    if(!invitation){
        res.status(400).send("Invitation not found");
        return null;
    }

    return invitation;
}

export const checkIfUserIsAbleToDeleteInvitation = async (invitation: Invitation, user: User, req: FastifyRequest, res: FastifyReply) => {
    //If user is the invited
    if(invitation.user === user) return true;
    
    //If user is the creator of the party
    const myParty = await connection.getRepository(Party).findOne({ id: invitation.party.id, creator: user });
    if(myParty){
        return true;
    }

    //If user is an organizer of the party
    const myInvitation = await connection.getRepository(Invitation).findOne({ user: user, party: invitation.party });
    if(myInvitation){
        if(myInvitation.role === UserRole.Organizer){
            return true;
        }
    }

    res.status(400).send("You are not able to delete this invitation");
    return false;
}

export const checkItemExists: (id: string, req: FastifyRequest, res: FastifyReply) => Promise<Item | null> = async (id, req, res) => { 
    const item = await connection.getRepository(Item).findOne({ id });
    if(!item){
        res.status(400).send("Sorry this item doesn't exist");
        return null;
    }
    return item;
}

export const checkItemIsEditableFromUser = (item: Item, user: User, req: FastifyRequest, res: FastifyReply) => {
    if(item.invitation.user.id === user.id){
        return true;
    }
    res.status(400).send("You are not authorize to deal with this item");
    return false;
}

export const checkItemIsAccessibleUser = async (item: Item, user: User, req: FastifyRequest, res: FastifyReply) => {
    const invitation = await connection.getRepository(Invitation).find({ user: user, party: item.invitation.party });
    if(!invitation){
        res.status(400).send("You are not authorize to deal with this item");
        return false;
    }
    return true;
}