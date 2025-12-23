import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const Legal = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold font-heading mb-2">Termes et Conditions — Skoolife</h1>
          <p className="text-muted-foreground mb-8">Dernière mise à jour : 23 décembre 2025</p>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
            <p>
              Les présents Termes et Conditions (les « Termes ») régissent votre accès et votre utilisation de l'application et du site Skoolife (le « Service ») exploités par Skoolife (ci-après « nous », « notre », « nos »).
            </p>
            <p>
              Veuillez lire attentivement ces Termes avant d'utiliser le Service.<br />
              En accédant au Service ou en l'utilisant, vous acceptez d'être lié par ces Termes. Si vous n'acceptez pas tout ou partie des Termes, vous ne devez pas utiliser le Service.
            </p>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">1) Définitions</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Compte</strong> : espace personnel créé pour accéder au Service.</li>
                <li><strong>Abonnement</strong> : accès payant au Service sur une base récurrente (mensuelle).</li>
                <li><strong>Contenu utilisateur</strong> : contenus que vous créez ou importez dans Skoolife (matières, examens, événements, notes, fichiers, liens, préférences).</li>
                <li><strong>Algorithme interne</strong> : mécanisme de calcul utilisé par Skoolife pour organiser/ajuster votre planning selon vos données et paramètres.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">2) Accès au Service</h2>
              <p>
                Le Service est destiné à aider à l'organisation des études (planning, matières, examens, sessions de révision, suivi). Certaines fonctionnalités peuvent évoluer, être ajoutées, modifiées ou supprimées à tout moment pour améliorer le Service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">3) Abonnements et paiements</h2>
              
              <h3 className="text-lg font-medium mt-4 mb-2">3.1 Abonnements</h3>
              <p>
                Certaines parties du Service peuvent être proposées sous forme d'abonnement (« Abonnement(s) »).<br />
                Vous êtes facturé à l'avance sur une base récurrente selon le cycle de facturation indiqué lors de la souscription (mensuel ou annuel).
              </p>
              <p>Sauf résiliation avant la date de renouvellement, l'Abonnement se renouvelle automatiquement dans les mêmes conditions.</p>

              <h3 className="text-lg font-medium mt-4 mb-2">3.2 Gestion, annulation</h3>
              <p>
                Vous pouvez annuler votre Abonnement depuis votre espace de gestion (si disponible) ou en contactant le support. L'annulation prend effet à la fin de la période en cours, sauf indication contraire au moment de l'achat.
              </p>

              <h3 className="text-lg font-medium mt-4 mb-2">3.3 Moyens de paiement</h3>
              <p>
                Une méthode de paiement valide peut être requise (ex : carte bancaire). Les paiements sont traités par un prestataire de paiement (ex : Stripe). Skoolife ne stocke pas les informations complètes de carte bancaire.
              </p>
              <p>Si un paiement échoue, l'accès à certaines fonctionnalités payantes peut être suspendu jusqu'à régularisation.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">4) Modifications de tarifs</h2>
              <p>
                Nous pouvons modifier les tarifs des Abonnements. Toute modification prend effet à la fin du cycle de facturation en cours.<br />
                Nous fournirons un préavis raisonnable (par exemple via e-mail ou via le Service). Votre utilisation continue après l'entrée en vigueur vaut acceptation des nouveaux tarifs.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">5) Remboursements</h2>
              <p>
                Les remboursements, lorsqu'ils existent, sont traités au cas par cas, sauf disposition légale impérative contraire.<br />
                Selon la nature du Service (contenu numérique/accès immédiat), certains achats peuvent ne pas être remboursables, sauf obligation légale ou politique plus favorable explicitement indiquée.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">6) Contenu utilisateur et licence</h2>
              
              <h3 className="text-lg font-medium mt-4 mb-2">6.1 Votre responsabilité</h3>
              <p>
                Vous êtes responsable de votre Contenu utilisateur (légalité, pertinence, exactitude, droits). Vous vous engagez à ne pas importer/téléverser de contenu :
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>illégal, diffamatoire, haineux, violent, harcelant, ou portant atteinte à autrui,</li>
                <li>contenant des données que vous n'avez pas le droit de partager,</li>
                <li>portant atteinte aux droits de propriété intellectuelle de tiers.</li>
              </ul>

              <h3 className="text-lg font-medium mt-4 mb-2">6.2 Licence limitée accordée à Skoolife</h3>
              <p>
                Vous conservez la propriété de votre Contenu utilisateur.<br />
                Cependant, pour fournir le Service, vous accordez à Skoolife une licence non exclusive, mondiale, gratuite et limitée permettant de héberger, stocker, traiter, afficher et organiser votre Contenu utilisateur uniquement pour l'exploitation et l'amélioration du Service (ex : affichage, synchronisation, sauvegarde, génération de planning).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">7) Planning et algorithme interne (absence de garantie)</h2>
              <p>
                Skoolife utilise un algorithme interne pour organiser et ajuster votre planning (par exemple selon vos examens, disponibilités, préférences, événements importés).
              </p>
              <p>Vous reconnaissez que :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>les suggestions/organisations proposées dépendent des informations saisies/importées,</li>
                <li>Skoolife ne garantit pas l'exactitude complète des imports (ex : fichiers calendrier) ni l'absence d'erreurs,</li>
                <li>Skoolife ne garantit aucun résultat académique (notes, réussite, progression) du fait de l'utilisation du Service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">8) Comptes et sécurité</h2>
              <p>
                Lors de la création d'un Compte, vous devez fournir des informations exactes et à jour.<br />
                Vous êtes responsable de la confidentialité de vos identifiants et de toute activité effectuée via votre Compte.
              </p>
              <p>Vous vous engagez à :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>ne pas partager vos identifiants,</li>
                <li>nous informer rapidement en cas d'utilisation non autorisée,</li>
                <li>ne pas utiliser un nom/identifiant usurpant l'identité d'un tiers ou offensant.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">9) Utilisation acceptable (interdictions)</h2>
              <p>Vous vous engagez à ne pas :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>tenter de contourner la sécurité, tester la vulnérabilité, ou accéder à des parties non autorisées,</li>
                <li>perturber le Service (attaque, surcharge, extraction massive de données),</li>
                <li>copier, modifier, reverse-engineerer ou tenter d'extraire le code source (sauf autorisation légale),</li>
                <li>utiliser le Service à des fins illégales ou contraires aux présents Termes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">10) Propriété intellectuelle</h2>
              <p>
                Le Service, son design, ses fonctionnalités, ses textes, logos et contenus (hors Contenu utilisateur) sont la propriété de Skoolife et/ou de ses concédants.<br />
                Toute reproduction, distribution ou utilisation non autorisée est interdite.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">11) Politique de droits d'auteur (réclamations)</h2>
              <p>
                Nous respectons les droits de propriété intellectuelle.<br />
                Si vous pensez qu'un contenu sur le Service porte atteinte à vos droits, contactez-nous en fournissant :
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>une description du contenu concerné,</li>
                <li>l'identification de l'œuvre protégée,</li>
                <li>vos coordonnées,</li>
                <li>une déclaration de bonne foi.</li>
              </ul>
              <p className="mt-2">Contact : <a href="mailto:skoolife.co@gmail.com" className="text-primary hover:underline">skoolife.co@gmail.com</a></p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">12) Liens vers des sites tiers</h2>
              <p>
                Le Service peut contenir des liens vers des sites ou services tiers. Nous ne contrôlons pas ces services et ne sommes pas responsables de leurs contenus, politiques ou pratiques. L'accès se fait à vos risques.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">13) Résiliation et suspension</h2>
              
              <h3 className="text-lg font-medium mt-4 mb-2">13.1 Par vous</h3>
              <p>
                Vous pouvez cesser d'utiliser le Service à tout moment. Vous pouvez demander la suppression de votre Compte via le support (selon les modalités prévues par le Service et la loi).
              </p>

              <h3 className="text-lg font-medium mt-4 mb-2">13.2 Par Skoolife</h3>
              <p>Nous pouvons suspendre ou résilier l'accès au Service (en tout ou partie), notamment en cas :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>de violation des présents Termes,</li>
                <li>d'usage abusif ou frauduleux,</li>
                <li>de risque de sécurité,</li>
                <li>d'obligation légale.</li>
              </ul>
              <p>Dans la mesure du possible, nous tenterons de vous prévenir, sauf urgence ou contrainte légale.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">14) Limitation de responsabilité</h2>
              <p>Dans les limites autorisées par la loi, Skoolife ne pourra être tenue responsable :</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>des pertes indirectes (perte de chance, perte de données, perte d'exploitation),</li>
                <li>des conséquences liées à l'utilisation du planning/suggestions (organisation, oublis, conflits d'horaires),</li>
                <li>de la fiabilité d'outils tiers (imports calendriers, liens externes),</li>
                <li>des interruptions temporaires, bugs ou indisponibilités du Service.</li>
              </ul>
              <p>Certaines législations n'autorisent pas certaines limitations : dans ce cas, elles s'appliqueront dans la mesure maximale autorisée.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">15) Avertissement (Service "en l'état")</h2>
              <p>
                Le Service est fourni « en l'état » et « selon disponibilité », sans garantie expresse ou implicite.<br />
                Nous ne garantissons pas que :
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>le Service sera toujours disponible sans interruption,</li>
                <li>il sera exempt d'erreurs,</li>
                <li>il répondra à toutes vos attentes spécifiques,</li>
                <li>il améliorera vos résultats académiques.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">16) Droit applicable</h2>
              <p>
                Les présents Termes sont régis par le droit français, sous réserve des règles protectrices applicables aux consommateurs.<br />
                En cas de litige, les juridictions compétentes seront déterminées conformément aux règles de procédure applicables.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">17) Modifications des Termes</h2>
              <p>
                Nous pouvons modifier ces Termes à tout moment. En cas de modification importante, nous vous en informerons via le Service et/ou par e-mail avant l'entrée en vigueur.<br />
                Si vous continuez à utiliser le Service après la date d'entrée en vigueur, vous acceptez les Termes mis à jour.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-8 mb-4">18) Nous contacter</h2>
              <p>
                Pour toute question concernant ces Termes :<br />
                <a href="mailto:skoolife.co@gmail.com" className="text-primary hover:underline">skoolife.co@gmail.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Legal;
