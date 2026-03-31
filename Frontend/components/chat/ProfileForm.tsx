'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Scheme } from '@/app/lib/mockApi'
import { getStoredProfile, setStoredProfile } from '@/app/lib/utils'

interface ProfileFormProps {
  scheme: Scheme | null
  isOpen: boolean
  onClose: () => void
  onSubmitProfile: (profile: Record<string, unknown>) => Promise<void> | void
}

export function ProfileForm({ scheme, isOpen, onClose, onSubmitProfile }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [age, setAge] = useState('')
  const [annualIncome, setAnnualIncome] = useState('')
  const [familyIncome, setFamilyIncome] = useState('')
  const [state, setState] = useState('')
  const [gender, setGender] = useState('')
  const [area, setArea] = useState('')
  const [community, setCommunity] = useState('')
  const [occupation, setOccupation] = useState('')
  const [isStudent, setIsStudent] = useState('no')
  const [isDisabled, setIsDisabled] = useState('no')
  const [isBpl, setIsBpl] = useState('no')

  useEffect(() => {
    if (!isOpen) return
    const stored = getStoredProfile()
    setAge(typeof stored.age === 'number' ? String(stored.age) : '')
    setAnnualIncome(typeof stored.annual_income === 'number' ? String(stored.annual_income) : '')
    setFamilyIncome(typeof stored.family_income === 'number' ? String(stored.family_income) : '')
    setState(typeof stored.state === 'string' ? stored.state : '')
    setGender(typeof stored.gender === 'string' ? stored.gender : '')
    setArea(typeof stored.area === 'string' ? stored.area : '')
    setCommunity(typeof stored.community === 'string' ? stored.community : '')
    setOccupation(typeof stored.occupation === 'string' ? stored.occupation : '')
    setIsStudent(stored.is_student ? 'yes' : 'no')
    setIsDisabled(stored.is_disabled ? 'yes' : 'no')
    setIsBpl(stored.is_bpl ? 'yes' : 'no')
  }, [isOpen])

  const parseNumber = (value: string) => {
    const digits = value.replace(/[^\d]/g, '')
    const num = Number.parseInt(digits, 10)
    return Number.isNaN(num) ? null : num
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const profile: Record<string, unknown> = { ...getStoredProfile() }
      const ageValue = parseNumber(age)
      const incomeValue = parseNumber(annualIncome)
      const familyIncomeValue = parseNumber(familyIncome)

      if (ageValue !== null) profile.age = ageValue
      if (incomeValue !== null) profile.annual_income = incomeValue
      if (familyIncomeValue !== null) profile.family_income = familyIncomeValue
      if (state.trim()) profile.state = state.trim().toLowerCase()
      if (gender.trim()) profile.gender = gender.trim().toLowerCase()
      if (area.trim()) profile.area = area.trim().toLowerCase()
      if (community) profile.community = community.toLowerCase()
      if (occupation) profile.occupation = occupation.toLowerCase()
      profile.is_student = isStudent === 'yes'
      profile.is_disabled = isDisabled === 'yes'
      profile.is_bpl = isBpl === 'yes'

      setStoredProfile(profile)
      await onSubmitProfile(profile)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[24px]">
        <DialogHeader>
          <DialogTitle>Eligibility Profile</DialogTitle>
          <DialogDescription className="text-base mt-2">
            Tell us about yourself to check eligibility for {scheme?.name || 'your selected scheme'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="text"
                value={age}
                onChange={(event) => setAge(event.target.value)}
                placeholder="e.g. 28"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="income">Annual Income</Label>
              <Input
                id="income"
                type="text"
                value={annualIncome}
                onChange={(event) => setAnnualIncome(event.target.value)}
                placeholder="e.g. 250000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="family-income">Family Income</Label>
              <Input
                id="family-income"
                type="text"
                value={familyIncome}
                onChange={(event) => setFamilyIncome(event.target.value)}
                placeholder="e.g. 400000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                type="text"
                value={state}
                onChange={(event) => setState(event.target.value)}
                placeholder="e.g. Tamil Nadu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger id="area">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urban">Urban</SelectItem>
                  <SelectItem value="rural">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="community">Community</Label>
              <Select value={community} onValueChange={setCommunity}>
                <SelectTrigger id="community">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="obc">OBC</SelectItem>
                  <SelectItem value="sc">SC</SelectItem>
                  <SelectItem value="st">ST</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Select value={occupation} onValueChange={setOccupation}>
                <SelectTrigger id="occupation">
                  <SelectValue placeholder="Select occupation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="salaried">Salaried</SelectItem>
                  <SelectItem value="self-employed">Self-employed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="student">Currently a student?</Label>
              <Select value={isStudent} onValueChange={setIsStudent}>
                <SelectTrigger id="student">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="disabled">Disability certificate?</Label>
              <Select value={isDisabled} onValueChange={setIsDisabled}>
                <SelectTrigger id="disabled">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bpl">BPL status?</Label>
              <Select value={isBpl} onValueChange={setIsBpl}>
                <SelectTrigger id="bpl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-border hover:bg-accent/10 rounded-full"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 rounded-full"
            >
              {isSubmitting ? 'Submitting...' : 'Check Eligibility'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
