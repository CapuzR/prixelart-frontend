export interface Testimonial {
    _id: string
    type: string
    name: string
    value: string
    avatar: string
    footer: string
    position?: number
    // company: { type: String, required: false },
    status: boolean
  
}