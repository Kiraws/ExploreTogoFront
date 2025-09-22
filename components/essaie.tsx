// Définir les champs pertinents par type
const fieldsByType = {
  loisirs: [
    'regionNom',
    'prefectureNom',
    'communeNom',
    'cantonNom',
    'etabNom',
    'description',
    'etabJour',
    'type',
    'geometry',
    'status',
    'etablissement_type',
  ],
  hotels: [
    'regionNom',
    'prefectureNom',
    'communeNom',
    'cantonNom',
    'nomLocalite',
    'etabNom',
    'description',
    'toiletteType',
    'type',
    'geometry',
    'status',
  ],
  parcs: [
    'regionNom',
    'prefectureNom',
    'communeNom',
    'cantonNom',
    'nomLocalite',
    'etabNom',
    'description',
    'etabJour',
    'toiletteType',
    'etabAdresse',
    'type',
    'activiteStatut',
    'activiteCategorie',
    'geometry',
    'status',
    'terrain',
  ],
  marches: [
    'regionNom',
    'prefectureNom',
    'communeNom',
    'cantonNom',
    'nomLocalite',
    'etabNom',
    'description',
    'etabJour',
    'type',
    'geometry',
    'status',
    'organisme',
  ],
  sites: [
    'regionNom',
    'prefectureNom',
    'communeNom',
    'cantonNom',
    'nomLocalite',
    'etabNom',
    'description',
    'etabJour',
    'etabAdresse',
    'type',
    'geometry',
    'status',
    'typeSiteDeux',
    'ministereTutelle',
    'religion',
  ],
  zones: [
    'regionNom',
    'prefectureNom',
    'communeNom',
    'cantonNom',
    'nomLocalite',
    'etabNom',
    'description',
    'type',
    'etabCreationDate',
    'geometry',
    'status',
  ],
  supermarches: [
    'regionNom',
    'prefectureNom',
    'communeNom',
    'cantonNom',
    'nomLocalite',
    'etabNom',
    'description',
    'etabJour',
    'toiletteType',
    'etabAdresse',
    'type',
    'activiteStatut',
    'activiteCategorie',
    'etabCreationDate',
    'geometry',
    'status',
  ],
  touristique: [
    'regionNom',
    'prefectureNom',
    'communeNom',
    'cantonNom',
    'nomLocalite',
    'etabNom',
    'description',
    'etabJour',
    'etabAdresse',
    'type',
    'geometry',
    'status',
  ],
}


<div className="flex flex-col gap-4 px-4 text-sm">
<div className="grid gap-4">
  <div className="flex flex-col gap-2">
    <Label htmlFor="etabNom">Nom de l&apos;établissement</Label>
    <Input id="etabNom" value={form.etabNom} onChange={onChange('etabNom')} />
  </div>
  <div className="flex flex-col gap-2">
    <Label htmlFor="type">Type</Label>
    <Select defaultValue={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}>
      <SelectTrigger id="type" className="w-full">
        <SelectValue placeholder="Sélectionner un type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="hotels">Hôtels</SelectItem>
        <SelectItem value="supermarches">Supermarchés</SelectItem>
        <SelectItem value="parcs">Parcs & Jardins</SelectItem>
        <SelectItem value="loisirs">Loisirs</SelectItem>
        <SelectItem value="marches">Marchés</SelectItem>
        <SelectItem value="sites">Sites Naturels</SelectItem>
        <SelectItem value="zones">Zones Protégées</SelectItem>
        <SelectItem value="touristique">Touristique</SelectItem>
      </SelectContent>
    </Select>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="flex flex-col gap-2">
      <Label htmlFor="regionNom">Région</Label>
      <Input id="regionNom" value={form.regionNom} onChange={onChange('regionNom')} />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="prefectureNom">Préfecture</Label>
      <Input id="prefectureNom" value={form.prefectureNom} onChange={onChange('prefectureNom')} />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="communeNom">Commune</Label>
      <Input id="communeNom" value={form.communeNom} onChange={onChange('communeNom')} />
    </div>
    <div className="flex flex-col gap-2">
      <Label htmlFor="cantonNom">Canton</Label>
      <Input id="cantonNom" value={form.cantonNom} onChange={onChange('cantonNom')} />
    </div>
  </div>
  {shouldShowField('nomLocalite') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="nomLocalite">Localité</Label>
      <Input id="nomLocalite" value={form.nomLocalite} onChange={onChange('nomLocalite')} />
    </div>
  )}
  {shouldShowField('etabAdresse') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="etabAdresse">Adresse</Label>
      <Input id="etabAdresse" value={form.etabAdresse} onChange={onChange('etabAdresse')} />
    </div>
  )}
  <div className="flex flex-col gap-2">
    <Label htmlFor="description">Description</Label>
    <Input id="description" value={form.description} onChange={onChange('description')} />
  </div>
  {shouldShowField('etabJour') && (
    <div className="flex flex-col gap-2">
      <Label>Jours d&apos;ouverture</Label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {openingDays.map((day) => (
          <div key={day} className="flex items-center space-x-2">
            <Checkbox
              id={`day-${day}`}
              checked={form.etabJour.includes(day)}
              onCheckedChange={(checked) => {
                setForm((prev) => ({
                  ...prev,
                  etabJour: checked
                    ? [...prev.etabJour, day]
                    : prev.etabJour.filter((d) => d !== day),
                }))
              }}
            />
            <Label htmlFor={`day-${day}`}>{day}</Label>
          </div>
        ))}
      </div>
    </div>
  )}
  {shouldShowField('toiletteType') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="toiletteType">Type de toilettes</Label>
      <Input id="toiletteType" value={form.toiletteType} onChange={onChange('toiletteType')} />
    </div>
  )}
  {shouldShowField('activiteStatut') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="activiteStatut">Statut d&apos;activité</Label>
      <Select
        value={form.activiteStatut}
        onValueChange={(value) => setForm((prev) => ({ ...prev, activiteStatut: value }))}
      >
        <SelectTrigger id="activiteStatut">
          <SelectValue placeholder="Sélectionner un statut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="En activité">En activité</SelectItem>
          <SelectItem value="En rénovation">En rénovation</SelectItem>
          <SelectItem value="Fermé">Fermé</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )}
  {shouldShowField('activiteCategorie') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="activiteCategorie">Catégorie d&apos;activité</Label>
      <Input
        id="activiteCategorie"
        value={form.activiteCategorie}
        onChange={onChange('activiteCategorie')}
      />
    </div>
  )}
  {shouldShowField('etabCreationDate') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="etabCreationDate">Date de création</Label>
      <Input
        id="etabCreationDate"
        value={form.etabCreationDate}
        onChange={onChange('etabCreationDate')}
      />
    </div>
  )}
  {shouldShowField('etablissement_type') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="etablissement_type">Type d&apos;établissement</Label>
      <Input
        id="etablissement_type"
        value={form.etablissement_type}
        onChange={onChange('etablissement_type')}
      />
    </div>
  )}
  {shouldShowField('terrain') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="terrain">Terrain</Label>
      <Input id="terrain" value={form.terrain} onChange={onChange('terrain')} />
    </div>
  )}
  {shouldShowField('organisme') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="organisme">Organisme</Label>
      <Input id="organisme" value={form.organisme} onChange={onChange('organisme')} />
    </div>
  )}
  {shouldShowField('typeSiteDeux') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="typeSiteDeux">Type de site</Label>
      <Input id="typeSiteDeux" value={form.typeSiteDeux} onChange={onChange('typeSiteDeux')} />
    </div>
  )}
  {shouldShowField('ministereTutelle') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="ministereTutelle">Ministère de tutelle</Label>
      <Input
        id="ministereTutelle"
        value={form.ministereTutelle}
        onChange={onChange('ministereTutelle')}
      />
    </div>
  )}
  {shouldShowField('religion') && (
    <div className="flex flex-col gap-2">
      <Label htmlFor="religion">Religion</Label>
      <Input id="religion" value={form.religion} onChange={onChange('religion')} />
    </div>
  )}
  {coordinates && (
    <div className="flex flex-col gap-2">
      <Label>Coordonnées GPS</Label>
      <div className="flex gap-4">
        <div>
          <span className="text-muted-foreground">Latitude: </span>
          {coordinates.lat}
        </div>
        <div>
          <span className="text-muted-foreground">Longitude: </span>
          {coordinates.lng}
        </div>
      </div>
    </div>
  )}
</div>
</div>